import { Button } from '@/components/ui/button';
import { formatLocalDate } from '@/lib/class-sheet';
import { siteConfig } from '@/lib/site-config';

/** Nothing to show: no data at all, nothing matching the filters, or a quiet day. */
export function EmptyDay({
	date,
	filtered,
	week = false,
	noData = false,
	nextDay,
	onNextDay,
	onClear,
}: {
	date: string;
	filtered: boolean;
	week?: boolean;
	noData?: boolean;
	nextDay: string | null;
	onNextDay: (date: string) => void;
	onClear: () => void;
}) {
	const title = noData
		? 'The timetable is being set.'
		: filtered
			? `Nothing matches ${week ? 'this week' : `on ${formatLocalDate(date)}`}.`
			: `No classes ${week ? 'this week' : `on ${formatLocalDate(date)}`}.`;
	const body = noData
		? `New classes open ${siteConfig.policies.bookingWindowDays} days ahead. Check back soon, or write to ${siteConfig.contact.email}.`
		: filtered
			? 'Loosen a filter, or jump to the next day that has one.'
			: 'The studios are quiet. The next class is a tap away.';
	return (
		<div role="status" className="border border-dashed border-concrete px-6 py-12 text-center sm:py-16">
			<p className="display-sm text-ink">{title}</p>
			<p className="mx-auto mt-3 max-w-[42ch] text-sm text-graphite">{body}</p>
			{noData ? null : (
				<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
					{nextDay ? (
						<Button variant="primary" size="sm" onClick={() => onNextDay(nextDay)}>
							{formatLocalDate(nextDay)} <span aria-hidden>→</span>
						</Button>
					) : null}
					{filtered ? (
						<Button variant="outline" size="sm" onClick={onClear}>
							Clear filters
						</Button>
					) : null}
				</div>
			)}
		</div>
	);
}
