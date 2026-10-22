'use client';

import dynamic from 'next/dynamic';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';

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

/** Payment, once a method is started: the Stripe element (or a pay-at-the-studio confirm). */
export function PaymentStep({ payLabel, onProcessingChange }: PaymentStepProps) {
	const { selectedProvider, paymentData, providers, submitting, isExpired, setStep, setError, handleSubmitCheckout, handleStartCheckout } = useCheckout();

	if (!paymentData) return null;
	const canPayAtStudio = providers.some((p) => p.name === 'cash');
	const studioFallback = canPayAtStudio ? (
		<Button variant="outline" size="md" className="mt-4" disabled={submitting || isExpired} onClick={() => void handleStartCheckout('cash')}>
			Confirm and pay at the studio
		</Button>
	) : (
		<p className="mt-2 text-sm text-graphite">Call the studio and we&rsquo;ll book you in by phone.</p>
	);

	return (
		<div className="space-y-6">
			{selectedProvider === 'stripe' && paymentData.clientSecret ? (
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
			) : selectedProvider === 'cash' ? (
				<div className="rounded-[4px] border border-line bg-paper p-6">
					<p className="headline text-[1.25rem] text-ink">Pay at the studio</p>
					<p className="mt-2 text-sm text-graphite">Your bed is held. Pay at the front desk when you arrive, card or cash.</p>
					<Button
						variant="primary"
						size="lg"
						className="mt-6"
						onClick={() => handleSubmitCheckout()}
						disabled={submitting || isExpired}
					>
						{submitting ? 'Confirming…' : 'Confirm booking'}
					</Button>
				</div>
			) : null}

			<button
				type="button"
				onClick={() => setStep('payment-select')}
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
