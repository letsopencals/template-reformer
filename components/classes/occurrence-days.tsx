import { clsx } from 'clsx';
import { OccurrenceRow } from '@/components/timetable/occurrence-row';
import { nextWithSpace, type Occurrence } from '@/lib/timetable';
import { dayLabel, type NameIndex } from './directory';

/**
 * Occurrences grouped by Berlin day, each day a mono label over a hairline list
 * of P2's `OccurrenceRow`s (deep links into the class sheet). Full rows point to
 * the next class with space, found in `all`. Days with nothing on show a quiet
 * line (pass them in to keep a fixed week); pass `today` to label it.
 */
export function OccurrenceDays({
	days,
	all,
	names,
	today,
	className,
}: {
	days: Array<{ date: string; occurrences: Occurrence[] }>;
	/** The whole timetable, for "next with space" on Full rows. */
	all: Occurrence[];
	names: NameIndex;
	today?: string;
	className?: string;
}) {
	return (
		<div className={clsx('space-y-8', className)}>
			{days.map((d) => {
				const id = `day-${d.date}`;
				return (
					<section key={d.date} aria-labelledby={id}>
						<h3 id={id} className="eyebrow flex items-baseline gap-3 border-b border-ink/80 pb-2 text-ink">
							<span>{dayLabel(d.date)}</span>
							{d.date === today ? <span className="text-steel">Today</span> : null}
							<span className="tabular ml-auto text-steel">
								{d.occurrences.length ? `${d.occurrences.length} ${d.occurrences.length === 1 ? 'class' : 'classes'}` : ''}
							</span>
						</h3>
						{d.occurrences.length ? (
							<ul className="divide-y divide-line sm:px-3">
								{d.occurrences.map((o) => (
									<OccurrenceRow
										key={o.key}
										occurrence={o}
										next={o.status === 'full' ? nextWithSpace(o, all) : null}
										instructorName={o.instructorId ? names.instructors[o.instructorId] : undefined}
									/>
								))}
							</ul>
						) : (
							<p className="py-4 text-sm text-steel">Nothing scheduled.</p>
						)}
					</section>
				);
			})}
		</div>
	);
}
