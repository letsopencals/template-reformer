import type { CheckoutResponse, PaymentInstructions } from '@opencals/storefront-sdk';
import { pendingReasonOf, strongestReason, type PendingReason } from '@/lib/booking-status';

/**
 * What checkout submit knows that the confirmation page can't load again:
 * the payment instructions (bank details, invoice link) and whether the
 * booking is waiting. Kept in sessionStorage per order for this tab; after a
 * reload in a new tab it's gone, and the page falls back to "check your email".
 */
export interface ConfirmationHandoff {
	instructions: PaymentInstructions | null;
	pendingReason: PendingReason | null;
	/** Order number, the bank transfer reference. */
	orderName: string | null;
}

const KEY = (orderId: string) => `tensile:confirmation:${orderId}`;

export function saveHandoff(response: Pick<CheckoutResponse, 'order' | 'paymentInstructions'>): void {
	const orderId = response.order?.id;
	if (!orderId) return;
	const reasons = (response.order.lineItems ?? []).map((li) => (li.appointment ? pendingReasonOf(li.appointment) : null));
	const value: ConfirmationHandoff = {
		instructions: response.paymentInstructions ?? null,
		pendingReason: strongestReason(reasons),
		orderName: response.order.name ?? null,
	};
	try {
		window.sessionStorage.setItem(KEY(orderId), JSON.stringify(value));
	} catch {
		// private mode or storage full: the page falls back to the email
	}
}

export function readHandoff(orderId: string): ConfirmationHandoff | null {
	try {
		const raw = window.sessionStorage.getItem(KEY(orderId));
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<ConfirmationHandoff> | null;
		if (!parsed || typeof parsed !== 'object') return null;
		const reason = parsed.pendingReason === 'awaiting_payment' || parsed.pendingReason === 'awaiting_approval' ? parsed.pendingReason : null;
		const instructions = parsed.instructions && typeof parsed.instructions === 'object' && typeof parsed.instructions.provider === 'string' ? parsed.instructions : null;
		return { instructions, pendingReason: reason, orderName: typeof parsed.orderName === 'string' ? parsed.orderName : null };
	} catch {
		return null;
	}
}
