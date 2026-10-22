'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { siteConfig } from '@/lib/site-config';
import { slotsToTimes, type PrivateTime } from './private-model';

const SWR_OPTS = { revalidateOnFocus: false } as const;

interface Target {
	/** Variant slug; null until a format is picked. */
	slug: string | null;
	staffMemberId: string | null;
	locationId: string | null;
}

function query(extra: Record<string, string | null>): string {
	const params = new URLSearchParams({ timezone: siteConfig.timezone });
	for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v);
	return params.toString();
}

/** Berlin dates with at least one free start (one merged-ranges call); null while loading. */
export function usePrivateOpenDays({ slug, staffMemberId, locationId }: Target) {
	const key = slug ? `/api/products/${slug}/availability-ranges?${query({ staffMemberId, locationId })}` : null;
	const { data, error, mutate } = useSWR<{ dates: string[] }>(key, fetcher, SWR_OPTS);
	const openDays = useMemo(() => (data?.dates ? new Set(data.dates) : null), [data]);
	return { openDays, error: Boolean(error), refresh: mutate };
}

/**
 * Free start times on one Berlin day. A start taken by the other format (the
 * private room is one product pool) simply isn't returned.
 */
export function usePrivateDayTimes({ slug, staffMemberId, locationId, date, now }: Target & { date: string | null; now: number | null }) {
	const key = slug && date ? `/api/products/${slug}/availability?${query({ date, staffMemberId, locationId })}` : null;
	const { data, error, isLoading, mutate } = useSWR<CurrentAvailabilitySlot[]>(key, fetcher, SWR_OPTS);
	const times: PrivateTime[] = useMemo(
		() => (date && now && Array.isArray(data) ? slotsToTimes(data, { date, now }) : []),
		[data, date, now],
	);
	const refresh = useCallback(() => void mutate(), [mutate]);
	return { times, loading: Boolean(key) && (isLoading || !now), error: Boolean(error), refresh };
}
