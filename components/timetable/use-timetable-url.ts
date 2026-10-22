'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Occurrence } from '@/lib/timetable';
import { parseTimetableParams, timetableSearch, type FilterKey, type TimetableParams } from '@/lib/timetable-url';

export interface TimetableUrl {
	params: TimetableParams;
	setFilter: (key: FilterKey, value: string | null) => void;
	clearFilters: () => void;
	setDay: (date: string) => void;
	openOccurrence: (o: Occurrence) => void;
	closeOccurrence: () => void;
}

/** Read the live URL, not a render snapshot, so quick successive clicks never drop a change. */
function current(): TimetableParams {
	return parseTimetableParams(new URLSearchParams(window.location.search));
}

function toInput(p: TimetableParams) {
	return { studio: p.studio, class: p.class, level: p.level, instructor: p.instructor, time: p.time, day: p.day, occ: p.occ };
}

/**
 * The timetable's state lives in the URL. Writes go through the native
 * History API, which Next 15 syncs into `useSearchParams` without a server
 * round trip. Filters and days replace the entry; opening a class pushes one,
 * so Back closes the sheet.
 */
export function useTimetableUrl(): TimetableUrl {
	const search = useSearchParams();
	const pathname = usePathname();
	const params = useMemo(() => parseTimetableParams(search), [search]);
	const pushedRef = useRef(false);
	useEffect(() => {
		if (!params.occ) pushedRef.current = false;
	}, [params.occ]);

	const write = useCallback(
		(next: TimetableParams, mode: 'push' | 'replace') => {
			const url = `${pathname}${timetableSearch(toInput(next))}`;
			if (mode === 'push') window.history.pushState(null, '', url);
			else window.history.replaceState(null, '', url);
		},
		[pathname],
	);

	const setFilter = useCallback(
		(key: FilterKey, value: string | null) => {
			const p = current();
			const v = key === 'level' ? (value === null ? null : Number(value)) : value;
			write({ ...p, [key]: v, occ: null } as TimetableParams, 'replace');
		},
		[write],
	);

	const clearFilters = useCallback(() => {
		write({ ...current(), studio: null, class: null, level: null, instructor: null, time: null, occ: null }, 'replace');
	}, [write]);

	const setDay = useCallback((date: string) => write({ ...current(), day: date }, 'replace'), [write]);

	const openOccurrence = useCallback(
		(o: Occurrence) => {
			const p = current();
			const next = { ...p, day: o.localDate, occ: { seriesSlug: o.seriesSlug, start: o.start } };
			// Switching classes inside an open sheet replaces; the first open pushes.
			if (p.occ) write(next, 'replace');
			else {
				pushedRef.current = true;
				write(next, 'push');
			}
		},
		[write],
	);

	const closeOccurrence = useCallback(() => {
		if (pushedRef.current) {
			pushedRef.current = false;
			window.history.back();
		} else {
			write({ ...current(), occ: null }, 'replace');
		}
	}, [write]);

	return { params, setFilter, clearFilters, setDay, openOccurrence, closeOccurrence };
}
