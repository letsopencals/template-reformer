import { cancelCutoff, formatDayTime } from '@/lib/class-sheet';
import { formatGap } from '@/lib/policy';

/** The cancellation window, quoted as an exact time. */
export function PolicyNote({ start, gapSeconds, now }: { start: string; gapSeconds: number; now: number | null }) {
	const c = cancelCutoff(start, gapSeconds, now ?? 0);
	const gap = formatGap(c.gapSeconds);
	return (
		<section className="mt-8 border-t border-line pt-6">
			<p className="eyebrow text-graphite">Cancelling</p>
			{c.passed ? (
				<p className="mt-1.5 text-sm text-ink">
					This class starts within {gap}. Once booked it can&rsquo;t be cancelled or moved.
				</p>
			) : (
				<p className="mt-1.5 text-sm text-ink">
					Free to cancel or move until <span className="tabular font-medium">{formatDayTime(c.at)}</span>
					<span className="text-graphite">, {gap} before class.</span> After that the bed is yours and the class is paid.
				</p>
			)}
		</section>
	);
}
