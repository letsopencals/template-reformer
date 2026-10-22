'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Occurrence } from '@/lib/timetable';
import type { TimetableLookup } from '@/lib/timetable-lookup';
import { ClassSheet } from '@/components/class-sheet/class-sheet';
import { useTimetableUrl } from './use-timetable-url';
import { useTimetableModel } from './use-timetable-model';
import { FilterBar } from './filter-bar';
import { WeekBoard } from './week-board';
import { WeekNav } from './week-nav';
import { DayStrip } from './day-strip';
import { DayView } from './day-view';
import { EmptyDay } from './empty-day';
import { FoundationsHint } from './foundations-hint';

export interface TimetableViewProps {
	occurrences: Occurrence[];
	lookup: TimetableLookup;
	/** Berlin date at render time (server), so the strip hydrates identically. */
	today: string;
}

/** The interactive timetable: filters, week poster (desktop), day view (mobile), class sheet. */
export function TimetableView({ occurrences, lookup, today }: TimetableViewProps) {
	const url = useTimetableUrl();
	const { params, setFilter, clearFilters, setDay, openOccurrence, closeOccurrence } = url;
	const model = useTimetableModel(occurrences, lookup, today, params);
	const [direction, setDirection] = useState(1);

	const presentKeys = useMemo(() => new Set(occurrences.map((o) => o.classKey)), [occurrences]);
	const classes = useMemo(() => lookup.classes.filter((c) => presentKeys.has(c.key)), [lookup.classes, presentKeys]);
	const presentStudios = useMemo(() => new Set(occurrences.map((o) => o.studioKey)), [occurrences]);
	const studios = useMemo(() => lookup.studios.filter((s) => presentStudios.has(s.key)), [lookup.studios, presentStudios]);
	const presentTeachers = useMemo(() => new Set(occurrences.map((o) => o.instructorId)), [occurrences]);
	const instructors = useMemo(() => lookup.instructors.filter((i) => presentTeachers.has(i.id)), [lookup.instructors, presentTeachers]);

	const changeDay = useCallback(
		(date: string) => {
			setDirection(date >= model.selectedDay ? 1 : -1);
			setDay(date);
		},
		[model.selectedDay, setDay],
	);
	const swipe = useCallback(
		(step: -1 | 1) => {
			const i = model.days.findIndex((d) => d.date === model.selectedDay);
			const target = model.days[i + step];
			if (target) changeDay(target.date);
		},
		[model.days, model.selectedDay, changeDay],
	);

	const dayOccurrences = model.days.find((d) => d.date === model.selectedDay)?.occurrences ?? [];
	const weekEmpty = model.week.every((d) => d.occurrences.length === 0);
	const emptyProps = { date: model.selectedDay, filtered: params.studio !== null || params.class !== null || params.level !== null || params.instructor !== null || params.time !== null, onClear: clearFilters };

	if (occurrences.length === 0) return <EmptyDay {...emptyProps} date={today} noData nextDay={null} onNextDay={changeDay} />;

	return (
		<>
			<FilterBar
				params={params}
				studios={studios}
				classes={classes}
				instructors={instructors}
				levels={lookup.levels}
				onChange={setFilter}
				onClear={clearFilters}
			/>
			{params.class === null && presentKeys.has('foundations') ? <FoundationsHint onPick={() => setFilter('class', 'foundations')} /> : null}

			<div className="mt-8 lg:hidden">
				<DayStrip days={model.days} selected={model.selectedDay} today={today} onSelect={changeDay} />
				<DayView
					date={model.selectedDay}
					occurrences={dayOccurrences}
					direction={direction}
					onSwipe={swipe}
					nextFor={model.nextFor}
					instructorName={model.instructorName}
					onOpen={openOccurrence}
					empty={<EmptyDay {...emptyProps} nextDay={model.nextMatchingDay(model.selectedDay)} onNextDay={changeDay} />}
				/>
			</div>

			<div className="mt-10 hidden lg:block">
				<WeekNav weekStarts={model.weekStarts} selectedDay={model.selectedDay} today={today} onSelect={changeDay} />
				{weekEmpty ? (
					<EmptyDay {...emptyProps} week nextDay={model.nextMatchingDay(model.week[6]?.date ?? model.selectedDay)} onNextDay={changeDay} />
				) : (
					<WeekBoard days={model.week} today={today} nextFor={model.nextFor} instructorName={model.instructorName} onOpen={openOccurrence} />
				)}
			</div>

			<ClassSheet
				occurrence={model.selected}
				all={model.all}
				lookup={lookup}
				onClose={closeOccurrence}
				onOpenOccurrence={openOccurrence}
				nextFor={model.nextFor}
			/>
		</>
	);
}
