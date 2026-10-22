'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useCheckout, type CheckoutStep } from '@/contexts/checkout-context';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { EmptyCard } from '@/components/cart/empty-card';
import { formatPrice } from '@/lib/format';
import { CarriageRail } from '@/components/motifs/carriage-rail';
import { CheckoutMasthead } from './checkout-masthead';
import { CheckoutSection, type SectionState } from './checkout-section';
import { CustomerStep } from './customer-step';
import { QuestionsStep } from './questions-step';
import { PaymentMethods } from './payment-methods';
import { PaymentStep } from './payment-step';
import { OrderStack } from './order-stack';
import { MobileSummary } from './mobile-summary';
import { PayBar } from './pay-bar';
import { primaryAction } from './primary-action';
import { CheckoutSkeleton } from './checkout-skeleton';

const SECTION_IDS = { details: 'checkout-step-details', questions: 'checkout-step-questions', payment: 'checkout-step-payment' };

function stepIndex(step: CheckoutStep): number {
	if (step === 'customer') return 0;
	if (step === 'questions') return 1;
	return 2;
}

function sectionState(current: number, mine: number): SectionState {
	if (current === mine) return 'open';
	return current > mine ? 'done' : 'locked';
}

function sectionFor(step: CheckoutStep): string {
	if (step === 'customer') return SECTION_IDS.details;
	if (step === 'questions') return SECTION_IDS.questions;
	return SECTION_IDS.payment;
}

/** /checkout — numbered sections on the left, the card stack on the right. */
export function CheckoutView() {
	const { cart, cartId, isLoaded } = useCart();
	const { checkoutComplete } = useCheckout();

	if (checkoutComplete) {
		return (
			<CheckoutShell>
				<div className="flex min-h-[40vh] flex-col items-center justify-center text-center" role="status">
					<span className="block w-40" aria-hidden>
						<CarriageRail value={1} />
					</span>
					<p className="display-sm mt-6 text-ink">
						Holding your <em>bed</em>…
					</p>
					<p className="mt-2 text-sm text-graphite">Taking you to your confirmation.</p>
				</div>
			</CheckoutShell>
		);
	}

	if (!isLoaded || (cartId && !cart)) {
		return (
			<CheckoutShell>
				<CheckoutSkeleton />
			</CheckoutShell>
		);
	}

	if (!cartId || !cart || (cart.items ?? []).length === 0) {
		return (
			<CheckoutShell>
				<EmptyCard className="flex flex-col items-center py-20 text-center" />
			</CheckoutShell>
		);
	}

	return <CheckoutBody />;
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
	return (
		<section className="pt-28 pb-24 sm:pt-32 lg:pt-40">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<CheckoutMasthead />
				{children}
			</div>
		</section>
	);
}

function CheckoutBody() {
	const { cart } = useCart();
	const {
		step,
		error,
		submitting,
		email,
		firstName,
		lastName,
		questions,
		answers,
		providers,
		selectedProvider,
		isExpired,
		setStep,
		setError,
		handleSubmitCheckout,
	} = useCheckout();
	const lenis = useSmoothScroll();

	const [chosen, setChosen] = useState<string | undefined>();
	const method = chosen && providers.some((p) => p.name === chosen) ? chosen : providers[0]?.name;
	const [stripeProcessing, setStripeProcessing] = useState(false);

	const hasQuestions = questions.length > 0;
	const current = stepIndex(step);
	const total = formatPrice(cart?.total ?? cart?.subtotal ?? 0, cart?.paymentCurrencyCode);

	// Bring the newly opened section into view and move focus into it, so
	// keyboard users don't land on <body> when the previous form folds away.
	const previousStep = useRef(step);
	useEffect(() => {
		if (previousStep.current === step) return;
		previousStep.current = step;
		const el = document.getElementById(sectionFor(step));
		if (!el) return;
		if (lenis) lenis.scrollTo(el, { offset: -110 });
		else el.scrollIntoView({ block: 'start', behavior: 'smooth' });
		const t = window.setTimeout(() => {
			el.querySelector<HTMLElement>('[data-section-body] :is(input, select, textarea, button)')?.focus({ preventScroll: true });
		}, 450);
		return () => window.clearTimeout(t);
	}, [step, lenis]);

	const fullName = [firstName, lastName].filter(Boolean).join(' ');
	const answered = Object.values(answers).filter((v) => v !== '' && v !== 'false').length;
	const paymentIndex = hasQuestions ? '03' : '02';

	const action = primaryAction({
		step,
		submitting,
		isExpired,
		hasEmail: Boolean(email),
		hasProviders: providers.length > 0,
		method,
		selectedProvider,
		stripeProcessing,
		total,
		onConfirmCash: () => void handleSubmitCheckout(),
	});

	return (
		<section className="pt-28 pb-32 sm:pt-32 lg:pt-40 lg:pb-28">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<CheckoutMasthead />

				<div className="mt-6 lg:mt-0 lg:grid lg:grid-cols-12 lg:gap-16 xl:gap-24">
					<div className="lg:col-span-7">
						<MobileSummary />

						{error ? (
							<div role="alert" className="mt-8 flex items-start gap-4 border-l-2 border-spring-red bg-spring-red-soft/60 px-5 py-4 text-sm text-ink">
								<p className="flex-1">{error}</p>
								<button
									type="button"
									onClick={() => setError(null)}
									className="eyebrow shrink-0 text-[0.6rem] text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
								>
									Dismiss
								</button>
							</div>
						) : null}

						<div className="mt-2 lg:mt-10">
							<CheckoutSection
								id={SECTION_IDS.details}
								index="01"
								title="Your details"
								state={sectionState(current, 0)}
								summary={[fullName, email].filter(Boolean).join(' · ')}
								onEdit={submitting ? undefined : () => setStep('customer')}
							>
								<CustomerStep />
							</CheckoutSection>

							{hasQuestions ? (
								<CheckoutSection
									id={SECTION_IDS.questions}
									index="02"
									title="A few questions"
									state={sectionState(current, 1)}
									summary={`${answered} of ${questions.length} answered`}
									lockedHint="So your teacher can set your springs."
									onEdit={submitting ? undefined : () => setStep('questions')}
								>
									<QuestionsStep />
								</CheckoutSection>
							) : null}

							<CheckoutSection
								id={SECTION_IDS.payment}
								index={paymentIndex}
								title="Payment"
								state={current === 2 ? 'open' : 'locked'}
								lockedHint="Card now, or pay at the studio where it’s offered."
							>
								{step === 'payment' ? (
									<PaymentStep payLabel={total} onProcessingChange={setStripeProcessing} />
								) : (
									<PaymentMethods method={method} onMethodChange={setChosen} />
								)}
							</CheckoutSection>

							<div className="border-t border-line" aria-hidden />
						</div>
					</div>

					<aside aria-label="Your classes" className="hidden lg:col-span-5 lg:block">
						<div className="sticky top-28 pt-10">
							<OrderStack />
						</div>
					</aside>
				</div>
			</div>

			<PayBar total={total} action={action} />
		</section>
	);
}
