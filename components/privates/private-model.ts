import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { physicalStudios, privatesAt, type Catalog, type ClassSeries, type PrivateFormat } from '@/lib/catalog';
import { localDates, localParts, timeOfDay, type TimeOfDay } from '@/lib/timetable';
import { siteConfig, type RoomMeta } from '@/lib/site-config';

/**
 * Pure model for the privates wizard: what the page passes to the client, and
 * how raw availability slots become bookable times. No React, so it's tested
 * in `private-model.test.ts` and safe in RSCs.
 */

export interface PrivateInstructor {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
	bio: string | null;
	languages: string[];
}

export interface PrivateStudioOption {
	id: string;
	key: string;
	name: string;
	short: string;
	address: string;
	transit: string | null;
	room: RoomMeta | null;
	solo: ClassSeries | null;
	duet: ClassSeries | null;
	/** Teachers on either format, sorted by name. */
	instructors: PrivateInstructor[];
}

/** Physical studios that offer at least one private format. */
export function buildPrivateStudios(catalog: Catalog): PrivateStudioOption[] {
	const metaById = new Map(catalog.instructors.map((i) => [i.id, i]));
	return physicalStudios(catalog)
		.map((studio) => {
			const { solo, duet } = privatesAt(catalog, studio.id);
			const refs = [...(solo?.instructors ?? []), ...(duet?.instructors ?? [])];
			const unique = [...new Map(refs.map((r) => [r.id, r])).values()].sort((a, b) => a.name.localeCompare(b.name));
			return {
				id: studio.id,
				key: studio.key,
				name: studio.name,
				short: studio.short,
				address: studio.address,
				transit: studio.meta?.transit ?? null,
				room: solo?.room ?? duet?.room ?? null,
				solo,
				duet,
				instructors: unique.map((r) => {
					const meta = metaById.get(r.id)?.meta ?? null;
					return { ...r, bio: meta?.bio ?? null, languages: meta?.languages ?? [] };
				}),
			};
		})
		.filter((s) => s.solo || s.duet);
}

/** People on the booking for a format: a duet is one seat for two. */
export function peopleFor(format: PrivateFormat): 1 | 2 {
	return format === 'duet' ? 2 : 1;
}

/** Instructors teaching a given series (falls back to everyone at the studio). */
export function instructorsForSeries(studio: PrivateStudioOption, series: ClassSeries | null): PrivateInstructor[] {
	if (!series || series.instructors.length === 0) return studio.instructors;
	const ids = new Set(series.instructors.map((i) => i.id));
	return studio.instructors.filter((i) => ids.has(i.id));
}

/* ------------------------------------------------------------------ Times */

export interface PrivateTime {
	/** UTC start ISO, stable key. */
	key: string;
	/** Berlin `HH:mm`. */
	time: string;
	part: TimeOfDay;
	slot: CurrentAvailabilitySlot;
	/** Teachers free at this start (merged across duplicate slots). */
	staffIds: string[];
}

/** A UTC `YYYY-MM-DD` + `HH:mm(:ss)` pair → epoch ms. */
export function utcMs(date: string, time: string): number {
	return Date.parse(`${date}T${time.length === 5 ? `${time}:00` : time}Z`);
}

/**
 * Availability slots for one picked Berlin day → bookable start times: only
 * starts on that local date and after `now`, deduped by start (teachers
 * merged), sorted.
 */
export function slotsToTimes(slots: CurrentAvailabilitySlot[], { date, now }: { date: string; now: number }): PrivateTime[] {
	const byStart = new Map<number, PrivateTime>();
	for (const slot of slots) {
		const start = utcMs(slot.fromDate, slot.fromTime);
		if (!Number.isFinite(start) || start <= now) continue;
		if ((slot.attendees ?? 0) >= (slot.maxAttendees || 1)) continue;
		const parts = localParts(start);
		if (parts.date !== date) continue;
		const prev = byStart.get(start);
		const staff = slot.staffMemberIds ?? [];
		if (prev) {
			prev.staffIds = [...new Set([...prev.staffIds, ...staff])];
			continue;
		}
		byStart.set(start, { key: new Date(start).toISOString(), time: parts.time, part: timeOfDay(parts.time), slot, staffIds: [...staff] });
	}
	return [...byStart.entries()].sort(([a], [b]) => a - b).map(([, t]) => t);
}

/** Times grouped by morning / midday / evening, empty groups dropped. */
export function groupTimes(times: PrivateTime[]): Array<{ part: TimeOfDay; times: PrivateTime[] }> {
	const order: TimeOfDay[] = ['morning', 'midday', 'evening'];
	return order.map((part) => ({ part, times: times.filter((t) => t.part === part) })).filter((g) => g.times.length > 0);
}

export interface StripDay {
	date: string;
	weekday: string;
	day: string;
	month: string;
	/** null while the open days are loading. */
	open: boolean | null;
}

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The day strip: `days` Berlin dates from `now`, each marked open/closed (or unknown). */
export function buildDayStrip(now: number, available: Set<string> | null, days = siteConfig.policies.bookingWindowDays): StripDay[] {
	return localDates(localParts(now).date, days).map((date) => {
		const d = new Date(`${date}T12:00:00Z`);
		return {
			date,
			weekday: WEEKDAY[(d.getUTCDay() + 6) % 7] ?? '',
			day: String(d.getUTCDate()),
			month: MONTH[d.getUTCMonth()] ?? '',
			open: available ? available.has(date) : null,
		};
	});
}

/* ------------------------------------------------------------- Deep links */

export interface PrivateDeepLink {
	studioId: string | null;
	format: PrivateFormat | null;
	/** Resolved teacher id (also kept when the studio isn't chosen yet). */
	instructorId: string | null;
}

/**
 * `/privates?studio=mitte&format=duet&instructor=lena-hoffmann` → initial
 * answers. An instructor who teaches privates at only one studio picks that
 * studio too. Unknown values are ignored.
 */
export function resolveDeepLink(studios: PrivateStudioOption[], q: { studio?: string | null; format?: string | null; instructor?: string | null }): PrivateDeepLink {
	const bare = q.instructor?.replace(/^staff-/, '') ?? null;
	const instructorId = bare ? (studios.flatMap((s) => s.instructors).find((i) => i.slug.replace(/^staff-/, '') === bare)?.id ?? null) : null;
	let studio = studios.find((s) => s.key === q.studio) ?? null;
	if (!studio && instructorId) {
		const theirs = studios.filter((s) => s.instructors.some((i) => i.id === instructorId));
		if (theirs.length === 1) studio = theirs[0]!;
	}
	const raw = q.format;
	const format: PrivateFormat | null = studio && (raw === 'solo' || raw === 'duet') && studio[raw] ? raw : null;
	return { studioId: studio?.id ?? null, format, instructorId };
}

/** Whether a teacher teaches a given private (used to carry a deep-linked teacher through). */
export function teaches(studio: PrivateStudioOption, series: ClassSeries | null, instructorId: string | null): boolean {
	return Boolean(instructorId) && instructorsForSeries(studio, series).some((i) => i.id === instructorId);
}
