'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { Reveal } from '@/components/motion/reveal';
import { toBookingView, type BookingView } from '@/components/account/booking-view';
import { CheckInPass } from '@/components/confirmation/check-in-pass';
import { ConfirmationHero } from '@/components/confirmation/confirmation-hero';
import { OrderSummary } from '@/components/confirmation/order-summary';
import { PassSkeleton } from '@/components/confirmation/pass-skeleton';
import { SignInPrompt } from '@/components/confirmation/sign-in-prompt';
import { CalendarLinks } from '@/components/confirmation/calendar-links';
import { PaymentInstructions } from '@/components/confirmation/payment-instructions';
import { manualProviderOf } from '@/components/confirmation/order-summary';
import { readHandoff, type ConfirmationHandoff } from '@/lib/confirmation-handoff';
import { strongestReason } from '@/lib/booking-status';

const SWR_OPTS = { revalidateOnFocus: false, errorRetryCount: 2 } as const;

function viewsOf(order: OrderDetailResponse | undefined): BookingView[] {
	return (order?.lineItems ?? [])
		.map((li) => li.appointment)
		.filter((a) => a != null)
		.map((a) => toBookingView(a))
		.sort((a, b) => a.start - b.start);
}

/**
 * The confirmation page. Checkout signs a trusted customer in (SDK 0.3.18 only
 * returns `auth` for them); with a session we load the order and print one
 * check-in pass per class. Without one, we say the booking is safe and offer a
 * sign-in code to see it here.
 */
export function ThankYouView({ orderId }: { orderId: string | null }) {
	const { status } = useSession();
	const key = orderId && status === 'authenticated' ? `/api/account/orders/${encodeURIComponent(orderId)}` : null;
	const { data: order, error, isLoading, mutate } = useSWR<OrderDetailResponse>(key, fetcher, SWR_OPTS);
	const views = useMemo(() => viewsOf(order), [order]);
	const loading = status === 'loading' || isLoading;
	const email = order?.customerEmail ?? order?.customer?.email ?? null;

	// What submit handed over in this tab (bank details, invoice link, waiting or not).
	const [handoff, setHandoff] = useState<ConfirmationHandoff | null>(null);
	useEffect(() => {
		setHandoff(orderId ? readHandoff(orderId) : null);
	}, [orderId]);

	// The loaded order is fresher than the hand-off (a booking may have been confirmed meanwhile).
	const pendingReason = views.length ? strongestReason(views.map((v) => v.pendingReason)) : (handoff?.pendingReason ?? null);
	const instructions = handoff?.instructions ?? null;
	const stillDue = Boolean(order && order.total > 0 && (order.paymentStatus === 'unpaid' || order.paymentStatus === 'partially-paid'));
	const manual = order ? manualProviderOf(order) : null;
	const emailFallback = stillDue && (manual === 'bank_transfer' || manual === 'stripe_invoice');
	const dueAt = instructions?.dueAt ?? order?.paymentDueAt ?? null;
	const showInstructions = stillDue || !order;

	return (
		<section className="pt-32 pb-24 lg:pt-40">
			<div className="container-x">
				<ConfirmationHero orderName={order?.name ?? handoff?.orderName ?? null} email={email} count={views.length} pendingReason={pendingReason} dueAt={dueAt} />

				<div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
					<div className="space-y-8">
						{loading ? (
							<PassSkeleton />
						) : status !== 'authenticated' ? (
							<SignInPrompt orderId={orderId} />
						) : views.length ? (
							views.map((v, i) => (
								<Reveal key={v.id} delay={Math.min(i, 3) * 0.08}>
									<CheckInPass view={v} index={i} total={views.length} />
								</Reveal>
							))
						) : (
							<LoadFailed failed={Boolean(error) || !orderId} onRetry={() => void mutate()} />
						)}
					</div>
					<aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
						{showInstructions ? <PaymentInstructions instructions={instructions} orderName={order?.name ?? handoff?.orderName ?? null} emailFallback={emailFallback} /> : null}
						{order ? <OrderSummary order={order} /> : null}
						{views.length > 1 ? <CalendarLinks views={views} /> : null}
					</aside>
				</div>
			</div>
		</section>
	);
}

function LoadFailed({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
	return (
		<div className="rounded-[4px] border border-line bg-paper p-6 sm:p-8">
			<p className="headline text-lg text-ink">{failed ? 'Your booking is in. The pass didn’t load.' : 'Nothing to show for this order.'}</p>
			<p className="mt-2 text-sm leading-relaxed text-graphite">
				Your confirmation email has the class, time and studio. You’ll also find it under Your week in your account.
			</p>
			{failed ? (
				<button type="button" onClick={onRetry} className="link-underline mt-4 text-sm text-ink">
					Try again
				</button>
			) : null}
		</div>
	);
}
