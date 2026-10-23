import { clsx } from 'clsx';
import type { Occurrence, TimeOfDay } from '@/lib/timetable';
import { timeOfDay } from '@/lib/timetable';
import { dayStats } from '@/lib/class-sheet';
import { OccurrenceTile } from './occurrence-tile';
import { BANDS, dayHeading } from './bands';

export interface BoardProps {
	days: Array<{ date: string; occurrences: Occurrence[] }>;
	today: string;
	nextFor: (o: Occurrence) => Occurrence | null;
	instructorName: (o: Occurrence) => string | undefined;
	onOpen: (o: Occurrence) => void;
}

/**
 * Desktop: the week as a poster. Seven equal day columns; each band (morning,
 * midday, evening) opens with a full-width label strip, so a 07:00 class always
 * sits level with the other 07:00s and no width is lost to a side gutter.
 */
export function WeekBoard({ days, today, nextFor, instructorName, onOpen }: BoardProps) {
	return (
		<div role="table" aria-label="Classes this week" className="grid grid-cols-7 border-t border-ink">
			<div role="row" className="contents">
				{days.map((d, i) => (
					<DayHead key={d.date} date={d.date} occurrences={d.occurrences} today={d.date === today} first={i === 0} />
				))}
			</div>
			{BANDS.map((band) => (
				<BandRows key={band.key} band={band} days={days} nextFor={nextFor} instructorName={instructorName} onOpen={onOpen} />
			))}
		</div>
	);
}

function DayHead({ date, occurrences, today, first }: { date: string; occurrences: Occurrence[]; today: boolean; first: boolean }) {
	const { weekday, day, month } = dayHeading(date);
	const stats = dayStats(occurrences);
	return (
		<div role="columnheader" className={clsx('relative px-3 pt-4 pb-4', first ? null : 'border-l border-line', today ? 'bg-paper' : null)}>
			{today ? <span aria-hidden className="absolute inset-x-0 -top-px h-[3px] bg-ink" /> : null}
			<p className="eyebrow text-graphite">
				{weekday}
				{today ? <span className="text-ink"> · Today</span> : null}
			</p>
			<p className="mt-1 flex items-baseline gap-1.5">
				<span className="display-sm leading-none">{day}</span>
				<span className="eyebrow text-steel">{month}</span>
			</p>
			<p className="tabular mt-2 text-[0.68rem] text-steel">{stats.classes === 0 ? 'No classes' : `${stats.open} of ${stats.classes} open`}</p>
			<span aria-hidden className="mt-1.5 block h-px w-full bg-line">
				<span className="block h-px bg-ink" style={{ width: `${Math.round(stats.fill * 100)}%` }} />
			</span>
		</div>
	);
}

function BandRows({
	band,
	days,
	nextFor,
	instructorName,
	onOpen,
}: Omit<BoardProps, 'today'> & { band: { key: TimeOfDay; label: string; hint: string } }) {
	const perDay = days.map((d) => d.occurrences.filter((o) => timeOfDay(o.localTime) === band.key));
	if (perDay.every((items) => items.length === 0)) return null;
	return (
		<>
			<div role="row" className="col-span-7">
				<div role="rowheader" className="flex items-baseline gap-3 border-t border-line bg-plaster-deep/50 px-3 py-2">
					<span className="eyebrow text-ink">{band.label}</span>
					<span className="tabular text-[0.66rem] text-steel">{band.hint}</span>
				</div>
			</div>
			<div role="row" className="contents">
				{days.map((d, i) => {
					const items = perDay[i] ?? [];
					return (
						<div role="cell" key={d.date} className={clsx('min-w-0 border-t border-line px-2 py-3', i === 0 ? null : 'border-l')}>
							{items.length === 0 ? (
								<span aria-hidden className="mx-1 mt-3 block h-px w-4 bg-line" />
							) : (
								<ul className="space-y-2">
									{items.map((o) => (
										<OccurrenceTile key={o.key} occurrence={o} next={o.status === 'full' ? nextFor(o) : null} instructorName={instructorName(o)} onOpen={onOpen} />
									))}
								</ul>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
}
