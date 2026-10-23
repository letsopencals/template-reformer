import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/**
 * Bed pips: one tiny bed per place, taken = ink, free = outlined. With more
 * than `max` places it collapses to a fill bar. Turns spring red at
 * `siteConfig.lowSeatsThreshold` or fewer, and reads "Full" at zero.
 */
export type PlaceUnit = readonly [one: string, many: string];

/** What a place is called: a bed on a reformer, a mat in the Mat Loft, a spot online. */
export function placeUnit(o: { kind: string; classKey: string }): PlaceUnit {
	if (o.kind === 'online') return ['spot', 'spots'];
	if (o.classKey.startsWith('mat')) return ['mat', 'mats'];
	return ['bed', 'beds'];
}

/** "3 beds left" / "1 spot left". */
export function placesLeft(n: number, unit: PlaceUnit = ['bed', 'beds']): string {
	return `${n} ${n === 1 ? unit[0] : unit[1]} left`;
}

export function BedPips({
	capacity,
	seatsLeft,
	max = 16,
	showLabel = true,
	unit = ['bed', 'beds'],
	className,
}: {
	capacity: number;
	seatsLeft: number;
	max?: number;
	showLabel?: boolean;
	unit?: PlaceUnit;
	className?: string;
}) {
	const taken = Math.max(0, capacity - seatsLeft);
	const full = seatsLeft <= 0;
	const low = !full && seatsLeft <= siteConfig.lowSeatsThreshold;
	const label = full ? 'Full' : placesLeft(seatsLeft, unit);
	return (
		<span className={clsx('inline-flex items-center gap-2', className)} aria-label={`${label} of ${capacity}`} role="img">
			{capacity <= max ? (
				<span aria-hidden className="flex flex-wrap gap-[3px]">
					{Array.from({ length: capacity }, (_, i) => (
						<span
							key={i}
							className={clsx(
								'h-[9px] w-[5px] rounded-[1px] border',
								i < taken ? (low || full ? 'border-spring-red bg-spring-red' : 'border-ink bg-ink') : 'border-concrete bg-transparent',
							)}
						/>
					))}
				</span>
			) : (
				<span aria-hidden className="relative block h-[9px] w-[5.5rem] border border-concrete">
					<span
						className={clsx('absolute inset-y-0 left-0', low || full ? 'bg-spring-red' : 'bg-ink')}
						style={{ width: `${Math.round((taken / Math.max(capacity, 1)) * 100)}%` }}
					/>
				</span>
			)}
			{showLabel ? (
				<span aria-hidden className={clsx('tabular text-[0.72rem]', full || low ? 'text-spring-red' : 'text-graphite')}>
					{label}
				</span>
			) : null}
		</span>
	);
}
