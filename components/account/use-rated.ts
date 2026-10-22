'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'tensile:rated';

/**
 * Booking ids this browser has sent feedback for, so the "How was it?" prompt
 * doesn't ask twice. A per-viewer convenience only: the feedback itself is on
 * the booking. Storage may be unavailable; then the prompt simply shows.
 */
export function useRated() {
	const [rated, setRated] = useState<Set<string>>(() => new Set());

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(KEY);
			if (raw) setRated(new Set(JSON.parse(raw) as string[]));
		} catch {
			/* storage blocked */
		}
	}, []);

	const markRated = useCallback((id: string) => {
		setRated((prev) => {
			const next = new Set(prev).add(id);
			try {
				window.localStorage.setItem(KEY, JSON.stringify([...next].slice(-50)));
			} catch {
				/* storage blocked */
			}
			return next;
		});
	}, []);

	return { rated, markRated };
}
