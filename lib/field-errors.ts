import type { OpencalsApiError } from '@opencals/storefront-sdk';

/**
 * Field validation errors, from the API to the field they belong to.
 *
 * A 400 from the API lists each rejected field by its full dotted path in the
 * request body (`customer.phone`, `customer.billingAddress.postalCode`, or a
 * plain `phone` on a top-level body). `lib/api-error-handler.ts` passes that
 * list through unchanged as `fieldErrors`; forms map it onto their inputs here.
 */

/** One field the API rejected: its path in the request body and the customer-facing messages. */
export type ApiFieldError = NonNullable<OpencalsApiError['errors']>[number];

/** Messages per form field, keyed by the form's field path (`phone`, `billingAddress.city`). */
export type FieldErrors<K extends string = string> = Partial<Record<K, string[]>>;

/** The `fieldErrors` list from a failed `/api/*` JSON body; empty when there is none. */
export function readFieldErrors(body: unknown): ApiFieldError[] {
	const list = body && typeof body === 'object' ? (body as { fieldErrors?: unknown }).fieldErrors : undefined;
	if (!Array.isArray(list)) return [];
	return list.filter(
		(e): e is ApiFieldError =>
			Boolean(e) && typeof e.property === 'string' && Array.isArray(e.messages) && e.messages.every((m: unknown) => typeof m === 'string'),
	);
}

/**
 * A property path as a form names its fields: everything up to and including
 * the last `customer` segment dropped, so `customer.phone` and `phone` are both
 * `phone`, and `customer.billingAddress.postalCode` is `billingAddress.postalCode`
 * (never the customer's own `postalCode` or `phone`).
 */
export function fieldPath(property: string): string {
	const parts = property.split('.');
	const i = parts.lastIndexOf('customer');
	return parts.slice(i + 1).join('.');
}

/**
 * Splits API field errors into the ones a form shows under one of its `fields`
 * and the rest (`unmapped`), which belong in the form's error banner.
 */
export function mapFieldErrors<K extends string>(errors: readonly ApiFieldError[], fields: readonly K[]): { byField: FieldErrors<K>; unmapped: ApiFieldError[] } {
	const byField: FieldErrors<K> = {};
	const unmapped: ApiFieldError[] = [];
	for (const e of errors) {
		const path = fieldPath(e.property);
		const field = fields.find((f) => f === path);
		const messages = e.messages.filter(Boolean);
		if (field && messages.length) byField[field] = [...(byField[field] ?? []), ...messages];
		else unmapped.push(e);
	}
	return { byField, unmapped };
}

/** True when at least one field has a message. */
export function hasFieldErrors(errors: FieldErrors): boolean {
	return Object.values(errors).some((m) => Boolean(m?.length));
}

/**
 * The banner line for a failed form: the messages no field could show, else the
 * API's own message when nothing was shown under a field, else nothing.
 */
export function bannerMessage(message: string | null | undefined, byField: FieldErrors, unmapped: readonly ApiFieldError[], fallback: string): string | null {
	if (unmapped.length) return unmapped.flatMap((e) => e.messages).join(' ') || message || fallback;
	return hasFieldErrors(byField) ? null : message || fallback;
}

/** `id` of the message under a field, for aria-describedby. */
export function errorId(inputId: string): string {
	return `${inputId}-error`;
}

/** aria props for an input with an optional hint and its field errors. */
export function fieldAria(inputId: string, messages: readonly string[] | undefined, hintId?: string): { 'aria-invalid'?: true; 'aria-describedby'?: string } {
	const invalid = Boolean(messages?.length);
	const describedBy = [invalid ? errorId(inputId) : null, hintId ?? null].filter(Boolean).join(' ');
	return { ...(invalid ? { 'aria-invalid': true as const } : {}), ...(describedBy ? { 'aria-describedby': describedBy } : {}) };
}

/** A phone number in the template's market, written the way the API wants it. */
export const PHONE_EXAMPLE = '+49 151 23456789';

/** Hint under every phone input. */
export const PHONE_HINT = `Include your country code, e.g. ${PHONE_EXAMPLE}`;

/**
 * Quick check before submitting: a phone without a leading `+` can't be in
 * international format. The API stays the judge of everything else.
 */
export function phoneFormatError(value: string): string | null {
	const v = value.trim();
	return v && !v.startsWith('+') ? `${PHONE_HINT}.` : null;
}
