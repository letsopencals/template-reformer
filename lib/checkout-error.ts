/**
 * Client side of `lib/api-error-handler.ts`: what a failed `/api/checkout/*`
 * call tells the checkout, read from the JSON body. Never throws on a body
 * that isn't JSON (a proxy's HTML 502, an empty 500).
 */
export class CheckoutError extends Error {
	readonly status: number;
	readonly code: string | null;
	readonly orderId: string | null;
	readonly paymentStatus: string | null;

	constructor(message: string, status: number, body: Record<string, unknown> | null) {
		super(message);
		this.name = 'CheckoutError';
		this.status = status;
		this.code = str(body?.code);
		this.orderId = str(body?.orderId);
		this.paymentStatus = str(body?.paymentStatus);
	}
}

function str(v: unknown): string | null {
	return typeof v === 'string' && v ? v : null;
}

export async function checkoutErrorFrom(res: Response, fallback: string): Promise<CheckoutError> {
	let body: Record<string, unknown> | null = null;
	try {
		const parsed: unknown = await res.json();
		if (parsed && typeof parsed === 'object') body = parsed as Record<string, unknown>;
	} catch {
		// not JSON
	}
	return new CheckoutError(str(body?.error) ?? fallback, res.status, body);
}

/** Wording for the conflicts the checkout can recover from; null = show the API's own message. */
export function checkoutErrorCopy(err: CheckoutError): string | null {
	switch (err.code) {
		case 'CART_EXPIRED':
			return 'Your hold ran out and someone has taken that bed. Pick a time again from the timetable.';
		case 'CHECKOUT_IN_PROGRESS':
			return 'Your booking is still going through. Give it a few seconds, then confirm again.';
		case 'PAYMENT_NOT_AUTHORIZED':
			return 'Your card wasn’t authorised. Nothing was charged. Try again, or use another card.';
		case 'CART_ALREADY_CHECKED_OUT':
			return 'This booking is already placed. Your confirmation email has the details.';
		default:
			return err.status === 402 ? 'Your card wasn’t authorised. Nothing was charged. Try again, or use another card.' : null;
	}
}
