'use client';

import { memo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { dayStats } from '@/lib/class-sheet';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import type { Occurrence } from '@/lib/timetable';
import { dayHeading } from './bands';

/**
 * Mobile: the booking window as a strip of days. Each day shows a fill line
 * (share of beds taken) and how many classes still have space.
 */
export const DayStrip = memo(function DayStrip({
	days,
	selected,
	today,
	onSelect,
}: {
	days: Array<{ date: string; occurrences: Occurrence[] }>;
	selected: string;
	today: string;
	onSelect: (date: string) => void;
}) {
	const listRef = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	useEffect(() => {
		// Scroll the strip only (scrollIntoView would also scroll the page).
		const list = listRef.current;
		const el = list?.querySelector<HTMLElement>(`[data-date="${selected}"]`);
		if (!list || !el) return;
		const offset = el.getBoundingClientRect().left - list.getBoundingClientRect().left;
		list.scrollTo({ left: list.scrollLeft + offset - (list.clientWidth - el.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
	}, [selected, reduce]);

	return (
		<div ref={listRef} role="tablist" aria-label="Choose a day" className="no-scrollbar -mx-5 flex snap-x gap-1.5 overflow-x-auto px-5 pb-1">
			{days.map((d) => {
				const { weekday, day } = dayHeading(d.date);
				const stats = dayStats(d.occurrences);
				const active = d.date === selected;
				return (
					<button
						key={d.date}
						type="button"
						role="tab"
						aria-selected={active}
						data-date={d.date}
						onClick={() => onSelect(d.date)}
						aria-label={`${weekday} ${day}${d.date === today ? ', today' : ''}: ${stats.classes === 0 ? 'no classes' : `${stats.open} of ${stats.classes} classes with space`}`}
						className={clsx(
							'flex w-[3.6rem] shrink-0 snap-start flex-col items-center rounded-[2px] border px-1 pt-2 pb-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
							active ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink',
						)}
					>
						<span className={clsx('eyebrow text-[0.58rem]', active ? 'text-paper/70' : 'text-graphite')}>{d.date === today ? 'Today' : weekday}</span>
						<span className="tabular mt-0.5 text-lg leading-none">{day}</span>
						<span aria-hidden className={clsx('mt-2 block h-[2px] w-8', active ? 'bg-paper/25' : 'bg-line')}>
							<span className={clsx('block h-full', active ? 'bg-paper' : 'bg-ink')} style={{ width: `${Math.round(stats.fill * 100)}%` }} />
						</span>
						<span className={clsx('tabular mt-1.5 text-[0.6rem]', active ? 'text-paper/70' : 'text-steel')}>
							{stats.classes === 0 ? '–' : `${stats.open} open`}
						</span>
					</button>
				);
			})}
		</div>
	);
});
