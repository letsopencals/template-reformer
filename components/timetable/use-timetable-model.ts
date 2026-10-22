'use client';

import { useCallback, useMemo } from 'react';
import { filterOccurrences, groupByDay, localDates, nextWithSpace, weekStart, type Occurrence } from '@/lib/timetable';
import type { TimetableParams } from '@/lib/timetable-url';
import type { TimetableLookup } from '@/lib/timetable-lookup';
import { siteConfig } from '@/lib/site-config';
import { useNow } from '@/hooks/use-now';

export interface TimetableModel {
	/** Not yet started (after hydration), unfiltered. */
	all: Occurrence[];
	/** Every day in the booking window, filtered. */
	days: Array<{ date: string; occurrences: Occurrence[] }>;
	selectedDay: string;
	/** The 7 days of the selected day's week (may run past the window). */
	week: Array<{ date: string; occurrences: Occurrence[] }>;
	weekStarts: string[];
	selected: Occurrence | null;
	nextFor: (o: Occurrence) => Occurrence | null;
	instructorName: (o: Occurrence) => string | undefined;
	/** First later day with a matching class, for the empty state. */
	nextMatchingDay: (from: string) => string | null;
}

export function useTimetableModel(occurrences: Occurrence[], lookup: TimetableLookup, today: string, params: TimetableParams): TimetableModel {
	const now = useNow();
	const nowMs = now?.getTime() ?? null;
	const all = useMemo(() => {
		if (nowMs === null) return occurrences;
		const iso = new Date(nowMs).toISOString();
		return occurrences.filter((o) => o.start > iso);
	}, [occurrences, nowMs]);

	const dates = useMemo(() => localDates(today, siteConfig.policies.bookingWindowDays), [today]);
	const bySlug = useMemo(() => new Map(lookup.instructors.map((i) => [i.slug, i])), [lookup.instructors]);
	const byId = useMemo(() => new Map(lookup.instructors.map((i) => [i.id, i])), [lookup.instructors]);

	const filtered = useMemo(
		() =>
			filterOccurrences(
				all,
				{ studio: params.studio, class: params.class, level: params.level, instructor: params.instructor, time: params.time },
				(slug) => bySlug.get(slug)?.id ?? null,
			),
		[all, params.studio, params.class, params.level, params.instructor, params.time, bySlug],
	);

	const days = useMemo(() => groupByDay(filtered, dates), [filtered, dates]);
	const selectedDay = params.day && dates.includes(params.day) ? params.day : today;

	const week = useMemo(() => {
		const start = weekStart(selectedDay);
		const weekDates = localDates(start, 7);
		return groupByDay(filtered, weekDates);
	}, [filtered, selectedDay]);

	const weekStarts = useMemo(() => [...new Set(dates.map(weekStart))], [dates]);

	const selected = useMemo(() => {
		const ref = params.occ;
		if (!ref) return null;
		return occurrences.find((o) => o.seriesSlug === ref.seriesSlug && o.start === ref.start) ?? null;
	}, [occurrences, params.occ]);

	const nextFor = useCallback((o: Occurrence) => nextWithSpace(o, all), [all]);
	const instructorName = useCallback((o: Occurrence) => (o.instructorId ? byId.get(o.instructorId)?.firstName : undefined), [byId]);
	const nextMatchingDay = useCallback((from: string) => days.find((d) => d.date > from && d.occurrences.length > 0)?.date ?? null, [days]);

	return { all, days, selectedDay, week, weekStarts, selected, nextFor, instructorName, nextMatchingDay };
}
