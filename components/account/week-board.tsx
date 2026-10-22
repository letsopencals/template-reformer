'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { localDates, localParts } from '@/lib/timetable';
import { dayLabel, type BookingView } from '@/components/account/booking-view';
import { BookingCard } from '@/components/account/booking-card';

const DAYS = 7;

function dayName(date: string, today: string, tomorrow: string): string {
	if (date === today) return 'Today';
	if (date === tomorrow) return 'Tomorrow';
	return dayLabel(Date.parse(`${date}T12:00:00Z`)).split(' ')[0] ?? date;
}

/**
 * "Your week": the next seven Berlin days as a poster board, each day with its
 * bookings or a quiet rest-day line, then everything further ahead.
 */
export function WeekBoard({ upcoming, onChanged }: { upcoming: BookingView[]; onChanged: () => void }) {
	const now = useNow(60_000);
	const { days, later, today, tomorrow } = useMemo(() => {
		const t = localParts(now ?? 0).date;
		const list = localDates(t, DAYS);
		const byDay = new Map<string, BookingView[]>(list.map((d) => [d, []]));
		const rest: BookingView[] = [];
		for (const v of upcoming) (byDay.get(v.date) ?? rest).push(v);
		return { days: [...byDay.entries()], later: rest, today: t, tomorrow: list[1] ?? '' };
	}, [upcoming, now]);

	if (!now) return null;

	return (
		<div className="space-y-12">
			<ol className="border-t border-ink">
				{days.map(([date, items]) => (
					<li key={date} className="grid gap-4 border-b border-line py-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8">
						<div className="flex items-baseline gap-3 md:block">
							<p className={clsx('headline text-xl', items.length ? 'text-ink' : 'text-steel')}>{dayName(date, today, tomorrow)}</p>
							<p className="tabular text-sm text-steel md:mt-1">{dayLabel(Date.parse(`${date}T12:00:00Z`))}</p>
						</div>
						{items.length ? (
							<div className="space-y-3">
								{items.map((v) => (
									<BookingCard key={v.id} view={v} onChanged={onChanged} />
								))}
							</div>
						) : (
							<p className="self-center text-sm text-steel">Rest day.</p>
						)}
					</li>
				))}
			</ol>

			{later.length ? (
				<section aria-labelledby="later-heading">
					<h2 id="later-heading" className="eyebrow mb-4 text-graphite">
						Further ahead · {later.length}
					</h2>
					<div className="space-y-3">
						{later.map((v) => (
							<div key={v.id}>
								<p className="tabular mb-2 text-sm text-graphite">{v.dayLabel}</p>
								<BookingCard view={v} onChanged={onChanged} />
							</div>
						))}
					</div>
				</section>
			) : null}

			<Link href="/timetable" className="link-underline inline-block text-sm text-ink">
				Book another class <span aria-hidden>→</span>
			</Link>
		</div>
	);
}
