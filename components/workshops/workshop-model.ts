import type { Catalog } from '@/lib/catalog';
import type { Occurrence } from '@/lib/timetable';
import { localParts } from '@/lib/timetable';
import { siteConfig, studioMeta, workshopMeta, type Spring } from '@/lib/site-config';
import type { BookingBody } from '@/components/privates/private-booking';

/**
 * Pure model for the workshops page: one listing per workshop with its open
 * dates. Workshops are never inferred Full; a sold-out date just isn't in the
 * occurrences, and a workshop with no open date reads "Sold out".
 */

export interface WorkshopTeacher {
	name: string;
	slug: string;
	image: string | null;
	bio: string | null;
}

export interface WorkshopListing {
	key: string;
	title: string;
	tagline: string | null;
	description: string;
	whatToBring: string[];
	spring: Spring;
	price: number;
	/** Seconds. */
	duration: number;
	capacity: number;
	studio: { key: string; name: string; short: string } | null;
	roomName: string | null;
	teacher: WorkshopTeacher | null;
	/** Open dates, soonest first. Empty = sold out. */
	dates: Occurrence[];
}

export function buildWorkshopListings(catalog: Catalog, occurrences: Occurrence[]): WorkshopListing[] {
	const instructors = new Map(catalog.instructors.map((i) => [i.id, i]));
	const listings = catalog.workshops.map((w): WorkshopListing => {
		const series = w.series[0] ?? null;
		const meta = workshopMeta(w.key);
		const ids = new Set(w.series.map((s) => s.id));
		const teacherRef = series?.instructor ?? null;
		const teacher = teacherRef ? instructors.get(teacherRef.id) : null;
		const room = meta?.room ? (studioMeta(series?.studio?.slug)?.rooms.find((r) => r.key === meta.room) ?? null) : null;
		return {
			key: w.key,
			title: w.title,
			tagline: meta?.tagline ?? null,
			description: meta?.description || w.description,
			whatToBring: meta?.whatToBring ?? [],
			spring: w.spring,
			price: series?.price ?? w.fromPrice,
			duration: series?.duration ?? w.duration,
			capacity: series?.capacity ?? 0,
			studio: series?.studio ? { key: series.studio.key, name: series.studio.name, short: series.studio.short } : null,
			roomName: room?.name ?? null,
			teacher: teacherRef
				? { name: teacherRef.name, slug: teacherRef.slug.replace(/^staff-/, ''), image: teacherRef.image, bio: teacher?.meta?.bio ?? null }
				: null,
			dates: occurrences.filter((o) => ids.has(o.seriesId) && o.status !== 'full' && o.seatsLeft > 0).sort((a, b) => a.start.localeCompare(b.start)),
		};
	});
	// Next date first; sold-out workshops last, by title.
	return listings.sort((a, b) => {
		const da = a.dates[0]?.start;
		const db = b.dates[0]?.start;
		if (da && db) return da.localeCompare(db);
		if (da || db) return da ? -1 : 1;
		return a.title.localeCompare(b.title);
	});
}

const DATE_PARTS = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: siteConfig.timezone });

/** Big-type date block parts, Berlin: `{ day: '31', month: 'Oct', weekday: 'Sat', time: '14:00–16:00' }`. */
export function dateBlock(o: Pick<Occurrence, 'start' | 'end'>): { day: string; month: string; weekday: string; time: string } {
	const parts: Record<string, string> = {};
	for (const p of DATE_PARTS.formatToParts(Date.parse(o.start))) parts[p.type] = p.value;
	return {
		day: parts.day ?? '',
		month: parts.month ?? '',
		weekday: parts.weekday ?? '',
		time: `${localParts(o.start).time}–${localParts(o.end).time}`,
	};
}

/** `/api/book` body for one workshop date (UTC slot from the occurrence). */
export function workshopBookingBody(o: Pick<Occurrence, 'seriesId' | 'start' | 'end' | 'instructorId' | 'studioId'>): BookingBody {
	return {
		slot: {
			productId: o.seriesId,
			fromDate: o.start.slice(0, 10),
			fromTime: o.start.slice(11, 19),
			toDate: o.end.slice(0, 10),
			toTime: o.end.slice(11, 19),
			staffMemberId: o.instructorId,
			locationId: o.studioId,
		},
		numberOfAttendees: 1,
		addOns: [],
	};
}
