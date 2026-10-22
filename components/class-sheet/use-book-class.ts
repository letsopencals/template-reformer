'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import type { Occurrence } from '@/lib/timetable';

export type BookPhase = 'idle' | 'booking' | 'held' | 'error';

/** UTC ISO → the API's `YYYY-MM-DD` / `HH:mm:ss`. */
function slotParts(iso: string): { date: string; time: string } {
	const d = new Date(iso).toISOString();
	return { date: d.slice(0, 10), time: d.slice(11, 19) };
}

const HELD_PAUSE_MS = 900;

/**
 * Hold a bed: POST /api/book (the class and its add-ons) into the current
 * cart, store the cart, show the "held" state for a beat, then go to
 * /checkout for details, questions and payment.
 */
export function useBookClass() {
	const router = useRouter();
	const { cartId, setCart } = useCart();
	const [phase, setPhase] = useState<BookPhase>('idle');
	const [error, setError] = useState<string | null>(null);

	const book = useCallback(
		async (o: Occurrence, addOns: Map<string, number>, reduceMotion: boolean) => {
			setPhase('booking');
			setError(null);
			const from = slotParts(o.start);
			const to = slotParts(o.end);
			try {
				const res = await fetch('/api/book', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(cartId ? { 'X-Cart-Id': cartId } : {}) },
					body: JSON.stringify({
						slot: {
							productId: o.seriesId,
							fromDate: from.date,
							fromTime: from.time,
							toDate: to.date,
							toTime: to.time,
							staffMemberId: o.instructorId,
							locationId: o.studioId,
						},
						numberOfAttendees: 1,
						addOns: [...addOns.entries()].filter(([, q]) => q > 0).map(([addOnId, quantity]) => ({ addOnId, quantity })),
					}),
				});
				const data = await res.json().catch(() => null);
				if (!res.ok || !data?.cart) throw new Error(bookingError(res.status, data?.error));
				setCart(data.cart);
				setPhase('held');
				window.setTimeout(() => router.push('/checkout'), reduceMotion ? 0 : HELD_PAUSE_MS);
			} catch (err) {
				setPhase('error');
				setError(err instanceof Error ? err.message : 'We couldn’t hold that bed.');
			}
		},
		[cartId, setCart, router],
	);

	const reset = useCallback(() => {
		setPhase('idle');
		setError(null);
	}, []);

	return { phase, error, book, reset };
}

function bookingError(status: number, message: unknown): string {
	if (status === 409 || status === 422) return 'Someone just took the last bed. Pick another class or try the next one with space.';
	if (status === 429) return 'Too many tries in a row. Wait a few seconds and book again.';
	return typeof message === 'string' && message ? message : 'We couldn’t hold that bed. Try again in a moment.';
}
