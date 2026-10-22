'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { computeAddOnLineTotal } from '@/lib/format';

/** Add-ons offered on a private (by variant slug, studio and teacher) plus the visitor's picks. */
export function usePrivateAddOns({ slug, locationId, staffMemberId }: { slug: string | null; locationId: string | null; staffMemberId: string | null }) {
	const params = new URLSearchParams();
	if (locationId) params.set('locationId', locationId);
	if (staffMemberId) params.set('staffMemberId', staffMemberId);
	const key = slug ? `/api/products/${slug}/add-ons${params.toString() ? `?${params}` : ''}` : null;
	const { data, isLoading, error } = useSWR<AddOnListItemResponse[]>(key, fetcher, { revalidateOnFocus: false });

	const [picked, setPicked] = useState<Map<string, number>>(() => new Map());
	const addOns = useMemo(() => (Array.isArray(data) ? data.filter((a) => a.status !== 'inactive') : []), [data]);

	// Only picks still on offer count (switching studio can change the list).
	const selected = useMemo(() => {
		const ids = new Set(addOns.map((a) => a.id));
		return new Map([...picked].filter(([id, q]) => ids.has(id) && q > 0));
	}, [picked, addOns]);

	const total = useMemo(
		() => addOns.reduce((sum, a) => sum + computeAddOnLineTotal(a, selected.get(a.id) ?? 0, 1), 0),
		[addOns, selected],
	);

	const setQuantity = useCallback((id: string, quantity: number) => {
		setPicked((prev) => {
			const next = new Map(prev);
			if (quantity <= 0) next.delete(id);
			else next.set(id, quantity);
			return next;
		});
	}, []);

	return { addOns, loading: Boolean(key) && isLoading, error: Boolean(error), selected, total, setQuantity };
}
