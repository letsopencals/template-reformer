'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import type { BookingBody } from './private-booking';

/**
 * Hold a bed: `POST /api/book` with the cart id, store the returned cart, then
 * go to checkout. Shared by the privates wizard and the workshop listing.
 * `onTaken` runs when the API rejects the slot (someone got there first).
 */
export function useAddToCart({ onTaken }: { onTaken?: () => void } = {}) {
	const router = useRouter();
	const { cartId, setCart } = useCart();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const book = useCallback(
		async (body: BookingBody) => {
			setPending(true);
			setError(null);
			try {
				const res = await fetch('/api/book', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(cartId ? { 'X-Cart-Id': cartId } : {}) },
					body: JSON.stringify(body),
				});
				const data = await res.json().catch(() => null);
				if (!res.ok || !data?.cart) {
					// Refresh availability either way: the usual cause is a slot that just went.
					onTaken?.();
					setError(res.status === 409 ? 'That time just went. Pick another one.' : (data?.error ?? 'We couldn’t hold that. Try again in a moment.'));
					setPending(false);
					return false;
				}
				setCart(data.cart);
				router.push('/checkout');
				return true;
			} catch {
				setError('No connection. Check your network and try again.');
				setPending(false);
				return false;
			}
		},
		[cartId, setCart, router, onTaken],
	);

	return { book, pending, error, clearError: useCallback(() => setError(null), []) };
}
