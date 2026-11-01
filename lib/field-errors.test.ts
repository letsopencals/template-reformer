import { describe, expect, it } from 'vitest';
import { bannerMessage, fieldAria, fieldPath, mapFieldErrors, phoneFormatError, PHONE_EXAMPLE, PHONE_HINT, readFieldErrors } from '@/lib/field-errors';

const PHONE_MSG = 'Enter the phone number with its country code, e.g. +44 7911 123456';

describe('field errors', () => {
	it('reads the fieldErrors list from an /api error body, ignoring junk', () => {
		expect(readFieldErrors({ error: 'x', fieldErrors: [{ property: 'customer.phone', messages: [PHONE_MSG] }, { property: 1 }, null] })).toEqual([
			{ property: 'customer.phone', messages: [PHONE_MSG] },
		]);
		expect(readFieldErrors({ error: 'x', errors: { phone: 'y' } })).toEqual([]);
		expect(readFieldErrors(null)).toEqual([]);
	});

	it('drops the customer wrapper but keeps address paths apart', () => {
		expect(fieldPath('customer.phone')).toBe('phone');
		expect(fieldPath('phone')).toBe('phone');
		expect(fieldPath('customer.billingAddress.postalCode')).toBe('billingAddress.postalCode');
		expect(fieldPath('deliveryAddress.phone')).toBe('deliveryAddress.phone');
		expect(fieldPath('appointment.customer.email')).toBe('email');
	});

	it('maps errors onto the form fields and leaves the rest for the banner', () => {
		const { byField, unmapped } = mapFieldErrors(
			[
				{ property: 'customer.phone', messages: [PHONE_MSG] },
				{ property: 'customer.billingAddress.phone', messages: ['Billing phone'] },
				{ property: 'email', messages: ['Enter a valid email'] },
				{ property: 'answers.0.answer', messages: ['Answer this'] },
			],
			['phone', 'email', 'firstName'] as const,
		);
		expect(byField).toEqual({ phone: [PHONE_MSG], email: ['Enter a valid email'] });
		expect(unmapped.map((e) => e.property)).toEqual(['customer.billingAddress.phone', 'answers.0.answer']);
		expect(bannerMessage('Invalid input.', byField, unmapped, 'Failed')).toBe('Billing phone Answer this');
		expect(bannerMessage('Invalid input.', byField, [], 'Failed')).toBeNull();
		expect(bannerMessage('Server down', {}, [], 'Failed')).toBe('Server down');
	});

	it('describes an invalid input by its message and hint', () => {
		expect(fieldAria('set-phone', [PHONE_MSG], 'set-phone-hint')).toEqual({ 'aria-invalid': true, 'aria-describedby': 'set-phone-error set-phone-hint' });
		expect(fieldAria('set-phone', undefined, 'set-phone-hint')).toEqual({ 'aria-describedby': 'set-phone-hint' });
		expect(fieldAria('first', undefined)).toEqual({});
	});

	it('flags a phone without a country code before submitting', () => {
		expect(phoneFormatError('07911 123456')).toBe(`${PHONE_HINT}.`);
		expect(phoneFormatError(` ${PHONE_EXAMPLE} `)).toBeNull();
		expect(phoneFormatError('  ')).toBeNull();
	});
});
