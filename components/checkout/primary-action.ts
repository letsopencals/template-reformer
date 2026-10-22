import type { CheckoutStep } from '@/contexts/checkout-context';
import { methodActionLabel } from './payment-methods';
import type { PrimaryAction } from './pay-bar';
import { DETAILS_FORM_ID, PAYMENT_METHOD_FORM_ID, QUESTIONS_FORM_ID, STRIPE_FORM_ID } from './form-ids';

export interface ActionInput {
	step: CheckoutStep;
	submitting: boolean;
	isExpired: boolean;
	hasEmail: boolean;
	hasProviders: boolean;
	method: string | undefined;
	selectedProvider: string | null;
	stripeProcessing: boolean;
	total: string;
	onConfirmCash: () => void;
}

/** What the mobile pay bar does at each step — mirrors the section's own submit button. */
export function primaryAction(i: ActionInput): PrimaryAction | null {
	const blocked = i.submitting || i.isExpired;
	switch (i.step) {
		case 'customer':
			return { label: i.submitting ? 'Saving…' : 'Continue', form: DETAILS_FORM_ID, disabled: blocked || !i.hasEmail, busy: i.submitting };
		case 'questions':
			return { label: i.submitting ? 'Saving…' : 'Continue', form: QUESTIONS_FORM_ID, disabled: blocked, busy: i.submitting };
		case 'payment-select':
			if (!i.hasProviders) return null;
			return {
				label: i.submitting ? 'One moment…' : methodActionLabel(i.method),
				form: PAYMENT_METHOD_FORM_ID,
				disabled: blocked || !i.method,
				busy: i.submitting,
			};
		case 'payment':
			if (i.selectedProvider === 'stripe') {
				const busy = i.stripeProcessing || i.submitting;
				return { label: busy ? 'Processing…' : `Pay ${i.total}`, form: STRIPE_FORM_ID, disabled: busy || i.isExpired, busy };
			}
			if (i.selectedProvider === 'cash') {
				return { label: i.submitting ? 'Confirming…' : 'Confirm booking', onClick: i.onConfirmCash, disabled: blocked, busy: i.submitting };
			}
			return null;
	}
}
