import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/**
 * Bed pips: one tiny bed per place, taken = ink, free = outlined. With more
 * than `max` places it collapses to a mono count. Turns spring red at
 * `siteConfig.lowSeatsThreshold` or fewer, and reads "Full" at zero.
 */
export function BedPips({
	capacity,
	seatsLeft,
	max = 16,
	showLabel = true,
	className,
}: {
	capacity: number;
	seatsLeft: number;
	max?: number;
	showLabel?: boolean;
	className?: string;
}) {
	const taken = Math.max(0, capacity - seatsLeft);
	const full = seatsLeft <= 0;
	const low = !full && seatsLeft <= siteConfig.lowSeatsThreshold;
	const label = full ? 'Full' : `${seatsLeft} ${seatsLeft === 1 ? 'bed' : 'beds'} left`;
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
			) : null}
			{showLabel ? (
				<span aria-hidden className={clsx('tabular text-[0.72rem]', full || low ? 'text-spring-red' : 'text-graphite')}>
					{label}
				</span>
			) : null}
		</span>
	);
}
