'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { BedPips } from '@/components/motifs/bed-pips';
import { useNow } from '@/hooks/use-now';
import { fetcher } from '@/lib/fetcher';
import { siteConfig } from '@/lib/site-config';
import { timetableHref } from '@/lib/timetable-url';
import { dayLabel, shortTitle, type BookingView } from '@/components/account/booking-view';
import { slotStarts } from '@/components/account/slots';
import { sameTimeNextWeek } from '@/components/confirmation/pass-helpers';

const SWR_OPTS = { revalidateOnFocus: false } as const;
const ARROW = <span aria-hidden>→</span>;

/**
 * "Same time next week?": checks the same series (class × studio × teacher) one
 * week on, live, and deep-links the timetable's class sheet for it. Weekly
 * classes only (not privates or workshops).
 */
export function SameTimeNextWeek({ view }: { view: BookingView }) {
	const next = useMemo(() => sameTimeNextWeek(view.start), [view.start]);
	const now = useNow(300_000);
	const q = new URLSearchParams({ productId: view.productId ?? '', date: next.date, timezone: siteConfig.timezone });
	if (view.staffMemberId) q.set('staffMemberId', view.staffMemberId);
	if (view.locationId) q.set('locationId', view.locationId);
	const key = view.productId && now ? `/api/availability?${q}` : null;
	const { data, isLoading, error } = useSWR<CurrentAvailabilitySlot[]>(key, fetcher, SWR_OPTS);

	const match = useMemo(() => {
		if (!data || !now) return null;
		const starts = slotStarts(data, { durationSec: view.minutes * 60, now: now.getTime() });
		return starts.find((s) => s.start === next.start) ?? null;
	}, [data, now, next.start, view.minutes]);

	const name = shortTitle(view);
	const label = `${dayLabel(next.start)} · ${next.time}`;
	const others = timetableHref({ class: view.classKey, day: next.date });

	if (!key || isLoading) {
		return <p className="eyebrow text-steel">Checking next week…</p>;
	}
	if (match && view.productSlug) {
		const href = timetableHref({ occ: { seriesSlug: view.productSlug, start: new Date(next.start).toISOString(), localDate: next.date } });
		return (
			<Link href={href} className="group flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-ink px-4 py-3 transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
				<span>
					<span className="eyebrow block opacity-70">Same time next week?</span>
					<span className="tabular mt-1 block text-[0.95rem]">{label}</span>
				</span>
				<span className="flex items-center gap-3">
					<BedPips capacity={match.capacity} seatsLeft={match.seatsLeft} className="group-hover:invert" />
					{ARROW}
				</span>
			</Link>
		);
	}
	return (
		<p className="text-sm text-graphite">
			{error ? 'We couldn’t check next week just now.' : `Next week’s ${next.time} ${name} has no free beds yet.`}{' '}
			<Link href={others} className="link-underline text-ink">
				See other {name} times {ARROW}
			</Link>
		</p>
	);
}
