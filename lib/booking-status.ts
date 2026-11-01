/**
 * Whether a booking is confirmed or still waiting, from the appointment itself.
 *
 * A booking waits only when it is `pending` WITH a `pendingReason`. Right after
 * checkout, a store that confirms automatically briefly returns `pending` with
 * no reason while a background job confirms it: that booking is confirmed, so
 * it reads as Booked, never as waiting.
 */
export type PendingReason = 'awaiting_payment' | 'awaiting_approval';

export function pendingReasonOf(appt: { status?: string | null; pendingReason?: string | null }): PendingReason | null {
	if (appt.status !== 'pending') return null;
	return appt.pendingReason === 'awaiting_payment' || appt.pendingReason === 'awaiting_approval' ? appt.pendingReason : null;
}

/** The reason that matters most for a set of bookings: the studio's approval beats payment. */
export function strongestReason(reasons: (PendingReason | null)[]): PendingReason | null {
	if (reasons.includes('awaiting_approval')) return 'awaiting_approval';
	if (reasons.includes('awaiting_payment')) return 'awaiting_payment';
	return null;
}

/** Short tag text ("Awaiting payment"). */
export function pendingTag(reason: PendingReason): string {
	return reason === 'awaiting_payment' ? 'Awaiting payment' : 'Awaiting confirmation';
}

/** One sentence for the account and pass. */
export function pendingLine(reason: PendingReason): string {
	return reason === 'awaiting_payment'
		? 'Your bed is held until your payment arrives.'
		: 'The studio still has to confirm this booking. We’ll email you once they do.';
}
