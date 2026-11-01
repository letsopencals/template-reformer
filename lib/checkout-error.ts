import type { CheckoutErrorCode, CheckoutErrorResponse } from '@opencals/storefront-sdk';
import { readFieldErrors, type ApiFieldError } from '@/lib/field-errors';

/** A failed `/api/checkout/*` response body: `error` is the message, the rest is the API's checkout error body. */
type CheckoutErrorBody = { error?: string } & Partial<CheckoutErrorResponse>;

/**
 * Client side of `lib/api-error-handler.ts`: what a failed `/api/checkout/*`
 * call tells the checkout, read from the JSON body. Never throws on a body
 * that isn't JSON (a proxy's HTML 502, an empty 500).
 */
export class CheckoutError extends Error {
	readonly status: number;
	readonly code: CheckoutErrorCode | null;
	readonly orderId: NonNullable<CheckoutErrorResponse['orderId']> | null;
	readonly paymentStatus: NonNullable<CheckoutErrorResponse['paymentStatus']> | null;
	/** The API's field validation errors, as `/api/*` passes them on. */
	readonly fieldErrors: ApiFieldError[];

	constructor(message: string, status: number, body: CheckoutErrorBody | null) {
		super(message);
		this.name = 'CheckoutError';
		this.status = status;
		this.code = str(body?.code);
		this.orderId = str(body?.orderId);
		this.paymentStatus = str(body?.paymentStatus);
		this.fieldErrors = readFieldErrors(body);
	}
}

/** A non-empty string field, else null (the body is parsed JSON, so check at runtime). */
function str<T extends string>(v: T | null | undefined): T | null {
	return typeof v === 'string' && v ? v : null;
}

export async function checkoutErrorFrom(res: Response, fallback: string): Promise<CheckoutError> {
	let body: CheckoutErrorBody | null = null;
	try {
		const parsed: unknown = await res.json();
		if (parsed && typeof parsed === 'object') body = parsed as CheckoutErrorBody;
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
