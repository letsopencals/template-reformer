'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { StripDay } from './private-model';

/**
 * Horizontal day strip over the booking window. Closed days stay visible but
 * disabled, so the rhythm of the studio's week reads at a glance.
 */
export const DayStrip = memo(function DayStrip({ days, selected, onPick }: { days: StripDay[]; selected: string | null; onPick: (date: string) => void }) {
	return (
		<div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0" data-lenis-prevent>
			<ul className="flex gap-1.5" role="list" aria-label="Pick a day">
				{days.map((d) => {
					const isSelected = d.date === selected;
					const closed = d.open === false;
					return (
						<li key={d.date} className="shrink-0">
							<button
								type="button"
								disabled={closed}
								aria-pressed={isSelected}
								aria-label={`${d.weekday} ${d.day} ${d.month}${closed ? ', no free times' : ''}`}
								onClick={() => onPick(d.date)}
								className={clsx(
									'flex w-14 flex-col items-center rounded-[2px] border py-2.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
									isSelected ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink',
									closed ? 'cursor-not-allowed border-transparent bg-transparent text-concrete hover:border-transparent' : null,
								)}
							>
								<span className="eyebrow text-[0.6rem] opacity-70">{d.weekday}</span>
								<span className={clsx('tabular mt-1 text-lg leading-none', closed ? 'line-through decoration-1' : null)}>{d.day}</span>
								<span className="eyebrow mt-1 text-[0.58rem] opacity-60">{d.month}</span>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
});
