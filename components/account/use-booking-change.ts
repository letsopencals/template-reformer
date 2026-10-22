'use client';

import { useCallback, useState } from 'react';
import { onSessionExpired } from '@/lib/session-expired';
import type { SlotStart } from '@/components/account/slots';

/**
 * Cancel or move one booking through the account API routes. Returns a
 * `run(kind, slot?)` that resolves true on success; `error` holds the API's
 * message (e.g. the backend closing the window a second before we did).
 */
export function useBookingChange(appointmentId: string) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const run = useCallback(
		async (kind: 'cancel' | 'reschedule', slot?: SlotStart['slot']): Promise<boolean> => {
			setPending(true);
			setError(null);
			try {
				const res = await fetch(`/api/account/appointments/${encodeURIComponent(appointmentId)}/${kind}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(kind === 'reschedule' ? { slot } : {}),
				});
				if (res.status === 401) {
					onSessionExpired();
					return false;
				}
				if (!res.ok) {
					const body = await res.json().catch(() => null);
					throw new Error(body?.error || (kind === 'cancel' ? 'We couldn’t cancel this booking.' : 'We couldn’t move this booking.'));
				}
				return true;
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
				return false;
			} finally {
				setPending(false);
			}
		},
		[appointmentId],
	);

	return { run, pending, error, clearError: () => setError(null) };
}
