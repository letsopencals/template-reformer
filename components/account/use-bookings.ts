'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import type { AppointmentListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { toBookingView } from '@/components/account/booking-view';
import { splitBookings } from '@/components/account/account-insights';

/**
 * The customer's bookings, newest first (one request: future bookings sort
 * first, so the 100 most recent always include every upcoming class), split
 * into upcoming / past / cancelled in Berlin time. `raw` feeds the level path.
 */
export const BOOKINGS_KEY = '/api/account/appointments?take=100&orderBy=from&order=DESC';

const SWR_OPTS = { revalidateOnFocus: false } as const;

export function useBookings() {
	const { data, error, isLoading, mutate } = useSWR<{ data: AppointmentListItemResponse[] }>(BOOKINGS_KEY, fetcher, SWR_OPTS);
	const now = useNow(60_000);
	const raw = useMemo(() => data?.data ?? [], [data]);
	const views = useMemo(() => raw.map((a) => toBookingView(a)), [raw]);
	const split = useMemo(() => (now ? splitBookings(views, now.getTime()) : null), [views, now]);
	return { raw, split, error, loading: isLoading || (!!data && !split), mutate };
}
