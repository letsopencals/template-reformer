'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { type Appearance, type StripeElementsOptions, type StripeError, loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { STRIPE_FORM_ID } from './form-ids';

const envPublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// DESIGN.md tokens as hex (Stripe's iframe can't read CSS variables): ink on
// paper, steel labels, hairline fields, 2px corners, Archivo and Plex Mono.
const INK = '#121212';
const PAPER = '#F6F5F1';
const GRAPHITE = '#55534E';
const STEEL = '#8A8F95';
const LINE = '#D6D3CC';
const CONCRETE = '#BDB9B0';
const SPRING_RED = '#D9412B';
const FOCUS = '0 0 0 3px rgba(18, 18, 18, 0.08)';

const APPEARANCE: Appearance = {
	theme: 'flat',
	variables: {
		colorPrimary: INK,
		colorBackground: PAPER,
		colorText: INK,
		colorTextSecondary: GRAPHITE,
		colorTextPlaceholder: STEEL,
		colorDanger: SPRING_RED,
		fontFamily: '"Archivo", system-ui, sans-serif',
		fontSizeBase: '15px',
		spacingUnit: '4px',
		borderRadius: '2px',
		focusBoxShadow: FOCUS,
		focusOutline: 'none',
	},
	rules: {
		'.Input': { border: `1px solid ${LINE}`, padding: '13px 16px', boxShadow: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' },
		'.Input:hover': { border: `1px solid ${CONCRETE}` },
		'.Input:focus': { border: `1px solid ${INK}`, boxShadow: FOCUS, backgroundColor: '#ffffff' },
		'.Input--invalid': { border: `1px solid ${SPRING_RED}` },
		'.Label': {
			color: GRAPHITE,
			fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
			fontSize: '11px',
			fontWeight: '500',
			textTransform: 'uppercase',
			letterSpacing: '0.14em',
			marginBottom: '8px',
		},
		'.Tab': { border: `1px solid ${LINE}`, backgroundColor: PAPER, color: GRAPHITE, boxShadow: 'none' },
		'.Tab:hover': { color: INK, border: `1px solid ${CONCRETE}` },
		'.Tab--selected': { border: `1px solid ${INK}`, color: INK, boxShadow: `inset 0 -2px 0 ${INK}` },
		'.TabIcon--selected': { fill: INK },
		'.Error': { fontSize: '12px', color: SPRING_RED },
	},
};

const FONTS: StripeElementsOptions['fonts'] = [
	{ cssSrc: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap' },
];

interface StripePaymentProps {
	clientSecret: string;
	stripeAccountId?: string | null;
	/** Key returned by checkout start (matches the account's test/live mode); the env var is the fallback. */
	publishableKey?: string | null;
	/** Shown when no key is configured: switch to another provider (pay at the studio). */
	fallback?: React.ReactNode;
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
	/** Total shown on the pay button. */
	payLabel?: string;
	/** Lets the page's mobile pay bar mirror the processing state. */
	onProcessingChange?: (processing: boolean) => void;
}

export function StripePayment({
	clientSecret,
	stripeAccountId,
	publishableKey: responseKey,
	fallback,
	onSuccess,
	onError,
	disabled,
	payLabel,
	onProcessingChange,
}: StripePaymentProps) {
	const publishableKey = responseKey || envPublishableKey;
	const stripePromise = useMemo(() => {
		if (!publishableKey) return null;
		return loadStripe(publishableKey, { stripeAccount: stripeAccountId ?? undefined });
	}, [publishableKey, stripeAccountId]);

	const options = useMemo<StripeElementsOptions>(() => ({ clientSecret, appearance: APPEARANCE, fonts: FONTS }), [clientSecret]);

	if (!publishableKey) {
		return (
			<div className="border border-line bg-plaster px-5 py-4" role="alert">
				<p className="eyebrow text-spring-red">Card payments are off</p>
				<p className="mt-1.5 text-sm text-ink">
					This studio hasn&rsquo;t switched on card payments yet
					{process.env.NODE_ENV === 'development' ? (
						<>
							{' '}
							(set <code className="tabular text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>)
						</>
					) : null}
					.
				</p>
				{fallback ?? null}
			</div>
		);
	}

	if (!stripePromise) return null;

	return (
		<Elements stripe={stripePromise} options={options}>
			<StripePaymentForm
				onSuccess={onSuccess}
				onError={onError}
				disabled={disabled}
				payLabel={payLabel}
				onProcessingChange={onProcessingChange}
			/>
		</Elements>
	);
}

function StripePaymentForm({
	onSuccess,
	onError,
	disabled,
	payLabel,
	onProcessingChange,
}: Omit<StripePaymentProps, 'clientSecret' | 'stripeAccountId' | 'publishableKey' | 'fallback'>) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		onProcessingChange?.(processing);
	}, [processing, onProcessingChange]);

	const handlePay = async (e: FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements || processing || disabled) return;
		setProcessing(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
			if (error) {
				onError((error as StripeError).message ?? 'Payment failed');
				return;
			}
			if (paymentIntent?.id) {
				onSuccess(paymentIntent.id);
			} else {
				onError('Payment confirmation did not return a valid result.');
			}
		} catch (err: unknown) {
			onError(err instanceof Error ? err.message : 'Payment failed');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<form id={STRIPE_FORM_ID} onSubmit={handlePay} aria-busy={processing}>
			<PaymentElement options={{ layout: 'tabs' }} />
			<Button
				type="submit"
				variant="primary"
				size="lg"
				fullWidth
				className="mt-7 max-lg:hidden"
				disabled={!stripe || !elements || processing || disabled}
			>
				{processing ? 'Processing payment…' : payLabel ? `Pay ${payLabel} and hold my bed` : 'Pay and hold my bed'}
			</Button>
			<p className="mt-4 flex items-center gap-2 text-xs text-graphite">
				<svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden>
					<rect x="3" y="7" width="10" height="7" />
					<path d="M5 7V5a3 3 0 016 0v2" />
				</svg>
				Card details go straight to Stripe, encrypted. We never see your card number.
			</p>
		</form>
	);
}
