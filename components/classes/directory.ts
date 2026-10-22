import type { ClassSeries, ClassType, Instructor, Studio } from '@/lib/catalog';
import { formatWholePrice } from '@/lib/format';
import { classMeta, siteConfig, type LevelStep, type Spring, type SpringInfo } from '@/lib/site-config';
import { groupByDay, localDates, localParts, type Occurrence } from '@/lib/timetable';
import { timetableHref } from '@/lib/timetable-url';

/**
 * Pure helpers for the classes, studios and instructors pages (P4). No React,
 * no fetching, so they're unit-tested in `directory.test.ts`.
 */

/** Light to heavy: the order springs hang on a reformer. */
export const SPRING_ORDER: Spring[] = ['green', 'yellow', 'blue', 'red'];

export interface SpringGroup<T> {
	spring: Spring;
	info: SpringInfo;
	items: T[];
}

/** Items grouped by spring, green → red. Empty springs are dropped; order within a group is kept. */
export function groupBySpring<T extends { spring: Spring }>(items: T[]): SpringGroup<T>[] {
	return SPRING_ORDER.map((spring) => ({
		spring,
		info: siteConfig.springs[spring],
		items: items.filter((i) => i.spring === spring),
	})).filter((g) => g.items.length > 0);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** `2026-10-27` → `Tue 27 Oct`. Reads the date string itself, so the host timezone can't shift it. */
export function dayLabel(localDate: string): string {
	const d = new Date(`${localDate}T12:00:00Z`);
	if (Number.isNaN(d.getTime())) return localDate;
	return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** Seconds → `50 min`. */
export function minutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min`;
}

/** Google Maps search link (no API key): coordinates when known, else the address. */
export function mapsHref(studio: Pick<Studio, 'address' | 'name' | 'latitude' | 'longitude'>): string {
	const query =
		studio.latitude !== null && studio.longitude !== null
			? `${studio.latitude},${studio.longitude}`
			: [studio.name, studio.address].filter(Boolean).join(', ');
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** The class-sheet deep link (P2 contract): `/timetable?day=<localDate>&occ=<seriesSlug>@<startISO>`. */
export function occurrenceHref(o: Pick<Occurrence, 'seriesSlug' | 'start' | 'localDate'>): string {
	return timetableHref({ occ: o });
}

/** A filtered timetable link (`/timetable?class=flow`), using the documented URL filters. */
export function filteredTimetableHref(filters: { class?: string; studio?: string; instructor?: string }): string {
	return timetableHref({ class: filters.class || null, studio: filters.studio || null, instructor: filters.instructor || null });
}

/** The next `days` local (Berlin) dates from `now`, each with its occurrences; empty days are kept. */
export function nextDays(occurrences: Occurrence[], days: number, now: number = Date.now()) {
	const dates = localDates(localParts(now).date, days);
	return groupByDay(occurrences, dates);
}

/** The level-path step a class belongs to, or null (Prenatal, Mat, Online sit outside the path). */
export function levelStepFor(classKey: string, steps: LevelStep[] = siteConfig.levels): LevelStep | null {
	return steps.find((s) => s.classKeys.includes(classKey)) ?? null;
}

/** A step's spring: the spring of its first class. */
export function stepSpring(step: LevelStep): Spring {
	return classMeta(step.classKeys[0])?.spring ?? 'yellow';
}

/** "After 10 Flow classes" for a step with a requirement, else null. */
export function requirementLabel(step: LevelStep): string | null {
	if (!step.requires) return null;
	const names = step.requires.classKeys.map((k) => classMeta(k)?.short ?? k).join(' or ');
	const n = step.requires.count;
	return `After ${n} ${names} ${n === 1 ? 'class' : 'classes'}`;
}

/** Look up catalog entries by id, keeping the input order and skipping unknown ids. */
export function pick<T extends { id: string }>(all: T[], ids: string[]): T[] {
	return ids.map((id) => all.find((x) => x.id === id)).filter((x): x is T => Boolean(x));
}

/** Class types an instructor teaches, in catalog order. */
export function classesTaughtBy(instructor: Pick<Instructor, 'classKeys'>, classTypes: ClassType[]): ClassType[] {
	return classTypes.filter((c) => instructor.classKeys.includes(c.key));
}

/** id → display name, for occurrence rows (studios by short name, instructors by full name). */
export function nameIndex(studios: Pick<Studio, 'id' | 'short'>[], instructors: Pick<Instructor, 'id' | 'name'>[]) {
	return {
		studios: Object.fromEntries(studios.map((s) => [s.id, s.short])) as Record<string, string>,
		instructors: Object.fromEntries(instructors.map((i) => [i.id, i.name])) as Record<string, string>,
	};
}

export type NameIndex = ReturnType<typeof nameIndex>;

/**
 * The display-only shape for `InstructorCard`: names, photo, languages,
 * studio short names and the classes they teach with springs. Built on the
 * server so no staff object reaches a client component.
 */
export function instructorCardData(
	instructor: Instructor,
	catalog: { classTypes: ClassType[]; studios: Studio[] },
) {
	return {
		slug: instructor.slug,
		name: instructor.name,
		image: instructor.image,
		bio: instructor.meta?.bio ?? null,
		languages: instructor.meta?.languages ?? [],
		studios: pick(catalog.studios, instructor.studioIds).map((s) => s.short),
		classes: classesTaughtBy(instructor, catalog.classTypes).map((c) => ({
			key: c.key,
			short: c.meta?.short ?? c.title,
			spring: c.spring,
		})),
	};
}

/** "1:1 €95 · Duet €130" from private series (lowest price per format), or null when there are none. */
export function privatesPriceLabel(series: Pick<ClassSeries, 'privateFormat' | 'price'>[]): string | null {
	const parts: string[] = [];
	for (const format of ['solo', 'duet'] as const) {
		const prices = series.filter((s) => s.privateFormat === format).map((s) => s.price);
		if (prices.length) parts.push(`${siteConfig.privates.formats[format].label} ${formatWholePrice(Math.min(...prices), siteConfig.currency)}`);
	}
	return parts.length ? parts.join(' · ') : null;
}
