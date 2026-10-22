'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import type { Occurrence } from '@/lib/timetable';

/** Add-ons offered for this class (grip socks, towel, shake) and the visitor's picks. */
export function useClassAddOns(o: Occurrence | null) {
	const key = useMemo(() => {
		if (!o || o.kind === 'online') return null;
		const q = new URLSearchParams();
		if (o.studioId) q.set('locationId', o.studioId);
		if (o.instructorId) q.set('staffMemberId', o.instructorId);
		return `/api/products/${encodeURIComponent(o.seriesSlug)}/add-ons?${q}`;
	}, [o]);
	const { data, isLoading, error } = useSWR<AddOnListItemResponse[]>(key, fetcher, { revalidateOnFocus: false });
	const addOns = useMemo(() => (Array.isArray(data) ? data.filter((a) => a.status !== 'inactive') : []), [data]);

	// Picks are keyed by series so another class starts empty (derived, no effect).
	const [picks, setPicks] = useState<{ series: string | null; qty: Map<string, number> }>({ series: null, qty: new Map() });
	const series = o?.seriesId ?? null;
	const selected = picks.series === series ? picks.qty : EMPTY;

	const setQuantity = useCallback(
		(addOnId: string, quantity: number) => {
			setPicks((prev) => {
				const next = new Map(prev.series === series ? prev.qty : EMPTY);
				if (quantity <= 0) next.delete(addOnId);
				else next.set(addOnId, quantity);
				return { series, qty: next };
			});
		},
		[series],
	);

	const total = useMemo(() => addOns.reduce((sum, a) => sum + a.price * (selected.get(a.id) ?? 0), 0), [addOns, selected]);

	return { addOns, loading: Boolean(key) && isLoading, failed: Boolean(error), selected, setQuantity, total };
}

const EMPTY: Map<string, number> = new Map();
