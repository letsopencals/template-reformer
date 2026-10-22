'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { groupTimes, type PrivateTime } from './private-model';

const PART_LABEL = { morning: 'Morning', midday: 'Midday', evening: 'Evening' } as const;

/** Start times for the picked day, grouped by part of day; with loading, empty and error states. */
export const TimeGrid = memo(function TimeGrid({
	times,
	loading,
	error,
	selected,
	hasDate,
	onPick,
	onRetry,
}: {
	times: PrivateTime[];
	loading: boolean;
	error: boolean;
	selected: string | null;
	hasDate: boolean;
	onPick: (key: string) => void;
	onRetry: () => void;
}) {
	if (!hasDate) return <p className="text-sm text-steel">Pick a day to see free times.</p>;
	if (loading) {
		return (
			<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6" aria-busy="true" aria-label="Loading times">
				{Array.from({ length: 8 }, (_, i) => (
					<span key={i} className="h-10 animate-pulse rounded-[2px] bg-plaster-deep" />
				))}
			</div>
		);
	}
	if (error) {
		return (
			<div className="flex flex-wrap items-center gap-4">
				<p className="text-sm text-graphite">We couldn’t load times for this day.</p>
				<Button variant="outline" size="sm" onClick={onRetry}>
					Try again
				</Button>
			</div>
		);
	}
	if (times.length === 0) return <p className="text-sm text-graphite">No free times this day. Try another day, or another teacher.</p>;

	return (
		<div className="space-y-5" aria-live="polite">
			{groupTimes(times).map((group) => (
				<div key={group.part}>
					<p className="eyebrow text-steel">{PART_LABEL[group.part]}</p>
					<ul className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6" role="list">
						{group.times.map((t) => (
							<li key={t.key}>
								<button
									type="button"
									aria-pressed={t.key === selected}
									onClick={() => onPick(t.key)}
									className={clsx(
										'tabular h-10 w-full rounded-[2px] border text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
										t.key === selected ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink',
									)}
								>
									{t.time}
								</button>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
});
