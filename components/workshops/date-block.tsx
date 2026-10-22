import type { Occurrence } from '@/lib/timetable';
import { dateBlock } from './workshop-model';

/** The date as a big typographic block: day numeral, month, weekday and time. */
export function DateBlock({ occurrence, more }: { occurrence: Occurrence | null; more: number }) {
	if (!occurrence) {
		return (
			<div aria-label="No dates">
				<p className="display-xl leading-none text-concrete" aria-hidden>
					—
				</p>
				<p className="eyebrow mt-3 text-steel">No open dates</p>
			</div>
		);
	}
	const d = dateBlock(occurrence);
	return (
		<time dateTime={occurrence.start} className="block">
			<span className="eyebrow block text-steel">
				{d.weekday} · {d.month}
			</span>
			<span className="display-xl mt-2 block leading-[0.85] text-ink">{d.day}</span>
			<span className="tabular mt-3 block text-sm text-ink">{d.time}</span>
			{more > 0 ? <span className="eyebrow mt-2 block text-steel">+{more} more {more === 1 ? 'date' : 'dates'}</span> : null}
		</time>
	);
}
