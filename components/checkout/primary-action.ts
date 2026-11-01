import type { CustomerProviderCatalogItem } from '@opencals/storefront-sdk';
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
	method: CustomerProviderCatalogItem['name'] | undefined;
	/** How the chosen method checks out (catalog `checkoutMode`). */
	methodMode: CustomerProviderCatalogItem['checkoutMode'] | undefined;
	selectedProvider: CustomerProviderCatalogItem['name'] | null;
	/** The started checkout shows a card form. */
	selectedIsCard: boolean;
	stripeProcessing: boolean;
	total: string;
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
				label: i.submitting ? 'One moment…' : methodActionLabel(i.method, i.methodMode),
				form: PAYMENT_METHOD_FORM_ID,
				disabled: blocked || !i.method,
				busy: i.submitting,
			};
		case 'payment':
			// Only card checkouts stop on this step; manual ones are placed straight after start.
			if (i.selectedIsCard) {
				const busy = i.stripeProcessing || i.submitting;
				return { label: busy ? 'Processing…' : `Pay ${i.total}`, form: STRIPE_FORM_ID, disabled: busy || i.isExpired, busy };
			}
			return null;
	}
}
