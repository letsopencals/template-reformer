import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/**
 * Beds left as a segmented bar: one segment per bed, taken = ink (spring red
 * when only a few are left), free = outlined. Segments fill from the left.
 */
export function CapacityBar({ capacity, seatsLeft, className }: { capacity: number; seatsLeft: number; className?: string }) {
	const taken = Math.max(0, Math.min(capacity, capacity - seatsLeft));
	const low = seatsLeft > 0 && seatsLeft <= siteConfig.lowSeatsThreshold;
	const label = `${seatsLeft} of ${capacity} ${capacity === 1 ? 'bed' : 'beds'} left`;
	return (
		<div className={className}>
			<div className="flex items-baseline justify-between">
				<span className="eyebrow text-steel">Beds</span>
				<span className={clsx('tabular text-sm', low ? 'text-spring-red' : 'text-ink')}>{label}</span>
			</div>
			<div role="meter" aria-label="Beds left" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={seatsLeft} aria-valuetext={label} className="mt-2 flex gap-[3px]">
				{Array.from({ length: capacity }, (_, i) => (
					<span
						key={i}
						className={clsx(
							'h-3 flex-1 rounded-[1px] border transition-colors duration-500',
							i < taken ? (low ? 'border-spring-red bg-spring-red' : 'border-ink bg-ink') : 'border-concrete bg-transparent',
						)}
					/>
				))}
			</div>
		</div>
	);
}
