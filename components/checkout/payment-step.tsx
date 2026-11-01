'use client';

import dynamic from 'next/dynamic';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { methodActionLabel } from './payment-methods';

// StripePayment pulls in Stripe (@stripe/react-stripe-js + stripe-js), which is
// heavy and only needed on the final step — load it on demand.
const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <StripeSkeleton />,
});

interface PaymentStepProps {
	/** Formatted total for the pay button. */
	payLabel: string;
	onProcessingChange: (processing: boolean) => void;
}

/**
 * Payment, once a card checkout is started: the Stripe element. Manual methods
 * (pay at the studio, bank transfer, invoice) and free bookings never stop here:
 * the checkout places them straight after start.
 */
export function PaymentStep({ payLabel, onProcessingChange }: PaymentStepProps) {
	const { selectedProvider, paymentData, providers, submitting, isExpired, setStep, setError, handleSubmitCheckout, handleStartCheckout } = useCheckout();

	if (!paymentData) return null;
	const offline = providers.find((p) => p.checkoutMode === 'manual');
	const studioFallback = offline ? (
		<Button variant="outline" size="md" className="mt-4" disabled={submitting || isExpired} onClick={() => void handleStartCheckout(offline.name)}>
			{methodActionLabel(offline.name, offline.checkoutMode)}
		</Button>
	) : (
		<p className="mt-2 text-sm text-graphite">Call the studio and we&rsquo;ll book you in by phone.</p>
	);
	const card = providers.find((p) => p.name === selectedProvider)?.checkoutMode === 'internal';

	return (
		<div className="space-y-6">
			{card && paymentData.clientSecret ? (
				<StripePayment
					clientSecret={paymentData.clientSecret}
					stripeAccountId={paymentData.stripeAccountId}
					publishableKey={paymentData.publishableKey}
					fallback={studioFallback}
					onSuccess={(piId) => handleSubmitCheckout(piId)}
					onError={(msg) => setError(msg)}
					disabled={isExpired || submitting}
					payLabel={payLabel}
					onProcessingChange={onProcessingChange}
				/>
			) : (
				<div className="rounded-[4px] border border-line bg-paper p-6">
					<p className="headline text-[1.25rem] text-ink">Card payment didn&rsquo;t open</p>
					<p className="mt-2 text-sm text-graphite">Choose another way to pay below, or try the card again.</p>
				</div>
			)}

			<button
				type="button"
				onClick={() => {
					setError(null);
					setStep('payment-select');
				}}
				disabled={submitting}
				className="link-underline text-xs text-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-40"
			>
				← Choose another way to pay
			</button>
		</div>
	);
}

function StripeSkeleton() {
	return (
		<div className="space-y-4" aria-busy="true" aria-label="Loading secure payment form">
			<div className="flex gap-3">
				<div className="image-placeholder h-16 flex-1" />
				<div className="image-placeholder h-16 flex-1" />
			</div>
			<div className="image-placeholder h-12" />
			<div className="grid grid-cols-2 gap-3">
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-12" />
			</div>
		</div>
	);
}
