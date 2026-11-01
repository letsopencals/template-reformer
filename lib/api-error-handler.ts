import { OpencalsApiError } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

/**
 * The API sends checkout conflicts with extra fields: `orderId` on 409
 * CART_ALREADY_CHECKED_OUT and the provider's `paymentStatus` on 402
 * PAYMENT_NOT_AUTHORIZED. Read them when the error carries them.
 */
type ApiErrorExtras = OpencalsApiError & { orderId?: unknown; paymentStatus?: unknown };

export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		const { orderId, paymentStatus } = err as ApiErrorExtras;
		const fieldErrors = err.toFieldErrors();
		return NextResponse.json(
			{
				error: err.message,
				...(err.code ? { code: err.code } : {}),
				...(typeof orderId === 'string' && orderId ? { orderId } : {}),
				...(typeof paymentStatus === 'string' && paymentStatus ? { paymentStatus } : {}),
				...(Object.keys(fieldErrors).length > 0 && { errors: fieldErrors }),
			},
			{ status: err.status },
		);
	}

	console.error(fallbackMessage, err);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
