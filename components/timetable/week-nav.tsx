import { clsx } from 'clsx';
import { localDates, weekStart } from '@/lib/timetable';
import { dayHeading } from './bands';

/** "Week of 26 Oct" with previous / next week, limited to the booking window. */
export function WeekNav({
	weekStarts,
	selectedDay,
	today,
	onSelect,
}: {
	weekStarts: string[];
	selectedDay: string;
	today: string;
	onSelect: (date: string) => void;
}) {
	const current = weekStart(selectedDay);
	const i = weekStarts.indexOf(current);
	const go = (j: number) => {
		const start = weekStarts[j];
		if (!start) return;
		// The first week starts today, not on a past Monday.
		onSelect(start < today ? today : start);
	};
	const [from, , , , , , to] = localDates(current, 7);
	const a = dayHeading(from ?? current);
	const b = dayHeading(to ?? current);

	return (
		<div className="mb-5 flex items-end justify-between gap-6">
			<p className="flex items-baseline gap-3" aria-live="polite">
				<span className="eyebrow text-graphite">{current <= today ? 'This week' : i === 1 ? 'Next week' : 'Later'}</span>
				<span className="tabular text-sm text-ink">
					{a.day} {a.month} – {b.day} {b.month}
				</span>
			</p>
			<div className="flex items-center gap-1.5">
				<NavButton label="Previous week" disabled={i <= 0} onClick={() => go(i - 1)} glyph="←" />
				<span className="tabular w-12 text-center text-xs text-steel">
					{i + 1}/{weekStarts.length}
				</span>
				<NavButton label="Next week" disabled={i < 0 || i >= weekStarts.length - 1} onClick={() => go(i + 1)} glyph="→" />
			</div>
		</div>
	);
}

function NavButton({ label, glyph, disabled, onClick }: { label: string; glyph: string; disabled: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			className={clsx(
				'flex h-10 w-10 items-center justify-center rounded-[2px] border border-line bg-paper text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-35',
			)}
		>
			<span aria-hidden>{glyph}</span>
		</button>
	);
}
