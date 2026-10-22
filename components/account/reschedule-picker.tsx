'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { clsx } from 'clsx';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { Chip } from '@/components/ui/chip';
import { BedPips } from '@/components/motifs/bed-pips';
import { Spinner } from '@/components/auth/auth-feedback';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { siteConfig } from '@/lib/site-config';
import { localParts } from '@/lib/timetable';
import { dayLabel, shortTitle, type BookingView } from '@/components/account/booking-view';
import { slotStarts, type SlotStart } from '@/components/account/slots';

const SWR_OPTS = { revalidateOnFocus: false } as const;
const TZ = siteConfig.timezone;

function seriesQuery(view: BookingView): URLSearchParams {
	const q = new URLSearchParams({ timezone: TZ });
	if (view.staffMemberId) q.set('staffMemberId', view.staffMemberId);
	if (view.locationId) q.set('locationId', view.locationId);
	return q;
}

/**
 * Pick a new time for the same series (same class, studio and teacher). Dates
 * with a free bed come from one merged-ranges call; each date's starts come
 * from availability with this booking excluded, so its own bed doesn't block it.
 */
export function ReschedulePicker({
	view,
	date,
	onDate,
	selected,
	onSelect,
}: {
	view: BookingView;
	date: string | null;
	onDate: (d: string) => void;
	selected: SlotStart | null;
	onSelect: (s: SlotStart) => void;
}) {
	const datesKey = view.productSlug ? `/api/products/${encodeURIComponent(view.productSlug)}/availability-ranges?${seriesQuery(view)}` : null;
	const { data: range, isLoading: datesLoading, error: datesError } = useSWR<{ dates: string[] }>(datesKey, fetcher, SWR_OPTS);
	const dates = useMemo(() => (range?.dates ?? []).filter((d) => d !== view.date), [range, view.date]);
	const now = useNow(60_000);
	const active = date ?? dates[0] ?? null;

	const slotsQuery = seriesQuery(view);
	if (active) slotsQuery.set('date', active);
	slotsQuery.set('productId', view.productId ?? '');
	slotsQuery.set('excludeAppointmentId', view.id);
	const slotsKey = active && view.productId ? `/api/availability?${slotsQuery}` : null;
	const { data: slots, isLoading: slotsLoading } = useSWR<CurrentAvailabilitySlot[]>(slotsKey, fetcher, SWR_OPTS);

	const starts = useMemo(() => {
		const opts = { durationSec: view.minutes * 60, now: now?.getTime() ?? 0, exclude: view.start, staffMemberId: view.staffMemberId, locationId: view.locationId };
		return slotStarts(slots ?? [], opts).filter((s) => localParts(s.start).date === active);
	}, [slots, view, active, now]);

	if (datesLoading) return <Spinner label="Finding times" />;
	if (datesError || !dates.length) {
		return (
			<p className="text-sm leading-relaxed text-graphite">
				No other {shortTitle(view)} class{view.teacherFirstName ? ` with ${view.teacherFirstName}` : ''}
				{view.studio ? ` in ${view.studio.short}` : ''} has a free bed in the booking window right now. Keep this one, or cancel and pick
				another class on the timetable.
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<fieldset>
				<legend className="eyebrow mb-3 text-graphite">Day</legend>
				<div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
					{dates.map((d) => (
						<Chip key={d} size="sm" selected={d === active} onClick={() => onDate(d)} className="tabular">
							{dayLabel(Date.parse(`${d}T12:00:00Z`))}
						</Chip>
					))}
				</div>
			</fieldset>
			<fieldset>
				<legend className="eyebrow mb-3 text-graphite">Time</legend>
				{slotsLoading ? (
					<Spinner label="Loading times" />
				) : starts.length ? (
					<ul className="divide-y divide-line border-y border-line">
						{starts.map((s) => {
							const on = selected?.start === s.start;
							return (
								<li key={s.start}>
									<button
										type="button"
										aria-pressed={on}
										onClick={() => onSelect(s)}
										className={clsx('flex w-full items-center justify-between gap-4 px-3 py-3.5 text-left transition-colors', on ? 'bg-ink text-paper' : 'hover:bg-plaster')}
									>
										<span className="tabular text-xl">{localParts(s.start).time}</span>
										<BedPips capacity={s.capacity} seatsLeft={s.seatsLeft} className={on ? 'invert' : undefined} />
									</button>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="text-sm text-graphite">No free beds that day. Pick another.</p>
				)}
			</fieldset>
		</div>
	);
}
