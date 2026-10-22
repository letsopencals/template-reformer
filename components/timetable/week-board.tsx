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
 * Desktop: the week as a poster. Seven day columns, three bands (morning,
 * midday, evening) so a 07:00 class always sits level with the other 07:00s.
 */
export function WeekBoard({ days, today, nextFor, instructorName, onOpen }: BoardProps) {
	return (
		<div role="table" aria-label="Classes this week" className="grid grid-cols-[5.5rem_repeat(7,minmax(0,1fr))] border-t border-ink">
			<div role="row" className="contents">
				<span role="columnheader" className="sr-only">
					Time of day
				</span>
				{days.map((d) => (
					<DayHead key={d.date} date={d.date} occurrences={d.occurrences} today={d.date === today} />
				))}
			</div>
			{BANDS.map((band) => (
				<BandRow key={band.key} band={band} days={days} nextFor={nextFor} instructorName={instructorName} onOpen={onOpen} />
			))}
		</div>
	);
}

function DayHead({ date, occurrences, today }: { date: string; occurrences: Occurrence[]; today: boolean }) {
	const { weekday, day, month } = dayHeading(date);
	const stats = dayStats(occurrences);
	return (
		<div role="columnheader" className={clsx('relative border-l border-line px-3 pt-4 pb-4', today ? 'bg-paper' : null)}>
			{today ? <span aria-hidden className="absolute inset-x-0 -top-px h-[3px] bg-ink" /> : null}
			<p className="eyebrow text-graphite">
				{weekday}
				{today ? <span className="text-ink"> · Today</span> : null}
			</p>
			<p className="mt-1 flex items-baseline gap-1.5">
				<span className="display-sm leading-none">{day}</span>
				<span className="eyebrow text-steel">{month}</span>
			</p>
			<p className="tabular mt-2 text-[0.68rem] text-steel">
				{stats.classes === 0 ? 'No classes' : `${stats.open}/${stats.classes} open`}
			</p>
			<span aria-hidden className="mt-1.5 block h-px w-full bg-line">
				<span className="block h-px bg-ink" style={{ width: `${Math.round(stats.fill * 100)}%` }} />
			</span>
		</div>
	);
}

function BandRow({
	band,
	days,
	nextFor,
	instructorName,
	onOpen,
}: Omit<BoardProps, 'today'> & { band: { key: TimeOfDay; label: string; hint: string } }) {
	return (
		<div role="row" className="contents">
			<div role="rowheader" className="border-t border-line pt-4 pr-3">
				<p className="eyebrow text-ink">{band.label}</p>
				<p className="tabular mt-1 text-[0.66rem] text-steel">{band.hint}</p>
			</div>
			{days.map((d) => {
				const items = d.occurrences.filter((o) => timeOfDay(o.localTime) === band.key);
				return (
					<div role="cell" key={d.date} className="min-h-24 border-t border-l border-line px-2 py-3">
						{items.length === 0 ? (
							<span aria-hidden className="mt-3 block h-px w-4 bg-line" />
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
	);
}
