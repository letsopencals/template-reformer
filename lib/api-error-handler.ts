import { OpencalsApiError, type CheckoutErrorResponse } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		// Checkout conflicts carry extra fields in the body: `orderId` on 409 CART_ALREADY_CHECKED_OUT,
		// the provider's `paymentStatus` on 402 PAYMENT_NOT_AUTHORIZED.
		const { orderId, paymentStatus } = (err.body ?? {}) as Partial<CheckoutErrorResponse>;
		const fieldErrors = err.toFieldErrors();
		return NextResponse.json(
			{
				error: err.message,
				...(err.code ? { code: err.code } : {}),
				...(typeof orderId === 'string' && orderId ? { orderId } : {}),
				...(typeof paymentStatus === 'string' && paymentStatus ? { paymentStatus } : {}),
				...(Object.keys(fieldErrors).length > 0 && { errors: fieldErrors }),
				// The API's field errors as sent (full dotted paths, every message): forms map them under each field.
				...(err.errors?.length ? { fieldErrors: err.errors } : {}),
			},
			{ status: err.status },
		);
	}

	console.error(fallbackMessage, err);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
