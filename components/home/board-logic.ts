import { localDates, localParts, nextWithSpace, type Occurrence } from '@/lib/timetable';
import { timetableHref } from '@/lib/timetable-url';

/**
 * Pure helpers for the home page's "Today at Tensile" board. No React, so the
 * RSC board and the tests share them (`board-logic.test.ts`).
 */

export interface BoardRow {
	occurrence: Occurrence;
	/** For a Full row: the next same-class occurrence with a free bed. */
	next: Occurrence | null;
	/** "Today", "Tomorrow" or "Wed 28 Oct". */
	dayLabel: string;
}

export interface Board {
	/** Heading word: today, tomorrow, or the next day with classes. */
	scope: 'today' | 'tomorrow' | 'later';
	rows: BoardRow[];
	/** Classes still to start today (Berlin), Full ones included. */
	classesLeftToday: number;
	/** Free beds across today's remaining classes. */
	bedsFreeToday: number;
	/** Classes in the next seven days. */
	classesThisWeek: number;
}

const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** `YYYY-MM-DD` → "Wed 28 Oct" (the date string is already Berlin-local). */
export function formatDay(date: string): string {
	return DAY_FORMAT.format(new Date(`${date}T12:00:00Z`)).replace(',', '');
}

export function dayLabel(date: string, today: string): string {
	if (date === today) return 'Today';
	if (date === localDates(today, 2)[1]) return 'Tomorrow';
	return formatDay(date);
}

const BOARD_KINDS = new Set<Occurrence['kind']>(['class', 'online']);

/**
 * The next `limit` group classes that haven't started yet, across every
 * studio. The timetable is cached for five minutes, so rows whose start has
 * passed are dropped here against `now`.
 */
export function selectBoard(all: Occurrence[], now: number, limit = 6): Board {
	const today = localParts(now).date;
	const weekEnd = now + 7 * 86_400_000;
	const upcoming = all.filter((o) => BOARD_KINDS.has(o.kind) && Date.parse(o.start) > now).sort((a, b) => a.start.localeCompare(b.start));
	const todays = upcoming.filter((o) => o.localDate === today);

	const picked = upcoming.slice(0, limit);
	const first = picked[0]?.localDate ?? null;
	const scope: Board['scope'] = first === null || first === today ? 'today' : first === localDates(today, 2)[1] ? 'tomorrow' : 'later';

	return {
		scope,
		rows: picked.map((o) => ({
			occurrence: o,
			next: o.status === 'full' ? nextWithSpace(o, all) : null,
			dayLabel: dayLabel(o.localDate, today),
		})),
		classesLeftToday: todays.length,
		bedsFreeToday: todays.reduce((sum, o) => sum + Math.max(0, o.seatsLeft), 0),
		classesThisWeek: upcoming.filter((o) => Date.parse(o.start) <= weekEnd).length,
	};
}

/** Deep link that opens the class sheet on the timetable (P2 contract, `lib/timetable-url.ts`). */
export function occurrenceHref(o: Pick<Occurrence, 'seriesSlug' | 'start' | 'localDate'>): string {
	return timetableHref({ occ: o });
}
