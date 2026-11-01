'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { usePaymentProviders } from '@/hooks/use-payment-providers';
import { useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { CheckoutError, checkoutErrorCopy, checkoutErrorFrom } from '@/lib/checkout-error';
import { bannerMessage, hasFieldErrors, mapFieldErrors, type FieldErrors } from '@/lib/field-errors';
import { saveHandoff } from '@/lib/confirmation-handoff';
import type {
	CustomerProviderCatalogItem,
	CheckoutCustomer,
	CheckoutQuestionAnswers,
	CheckoutStartResponse,
	CheckoutResponse,
	StartCheckout,
	SubmitCheckout,
	CartItem,
	CheckoutQuestionResponse as CheckoutQuestion,
	PaymentProviderName,
} from '@opencals/storefront-sdk';

export type CheckoutStep = 'customer' | 'questions' | 'payment-select' | 'payment';

/** The "Your details" fields, by their path in the customer payload (the API's `customer.email` is `email`). */
export type CustomerField = 'email' | 'firstName' | 'lastName';
const CUSTOMER_FIELDS: readonly CustomerField[] = ['email', 'firstName', 'lastName'];

type CheckoutMode = CustomerProviderCatalogItem['checkoutMode'];

const IN_PROGRESS_RETRIES = 2;
const IN_PROGRESS_DELAY_MS = 1500;

/**
 * How the started checkout continues: `internal` (card form here), `redirect`
 * (hosted page), `manual` (cash, bank transfer, invoice) or `none` (nothing to
 * pay). From the provider's catalog entry; the "no payment required" fallback
 * the backend may swap in is `none`. An unknown provider without a card
 * session is treated as manual, so it never strands the visitor on an empty
 * payment step.
 */
function checkoutModeOf(data: CheckoutStartResponse, provider: CustomerProviderCatalogItem | undefined): CheckoutMode {
	if (data.provider === 'no_payment_required') return 'none';
	if (provider) return provider.checkoutMode;
	if (data.redirectUrl) return 'redirect';
	return data.clientSecret ? 'internal' : 'manual';
}

interface CheckoutContextValue {
	// State
	step: CheckoutStep;
	error: string | null;
	submitting: boolean;
	checkoutComplete: boolean;
	/** A held bed was taken while checking out (409 CART_EXPIRED): offer a fresh start. */
	holdLost: boolean;

	// Customer
	email: string;
	firstName: string;
	lastName: string;
	customerId: string | null;
	/** The API's messages for the "Your details" fields, shown under each one; a field's clear when it's edited. */
	fieldErrors: FieldErrors<CustomerField>;
	setEmail: (v: string) => void;
	setFirstName: (v: string) => void;
	setLastName: (v: string) => void;

	// Questions
	questions: CheckoutQuestion[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;

	// Payment
	providers: CustomerProviderCatalogItem[];
	selectedProvider: PaymentProviderName | null;
	paymentData: CheckoutStartResponse | null;

	// Cart info
	items: CartItem[];
	isExpired: boolean;
	timeRemaining: number | null;
	minutes: number | null;
	seconds: number | null;

	// Actions
	setStep: (step: CheckoutStep) => void;
	setError: (error: string | null) => void;
	handleSaveCustomer: (e: React.FormEvent) => Promise<void>;
	handleSaveAnswers: (e: React.FormEvent) => Promise<void>;
	handleStartCheckout: (providerName: PaymentProviderName) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<void>;
	restartBooking: () => void;
	extendCart: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { cart, cartId, isLoaded, timeRemaining, extendCart, clearCart } = useCart();

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);
	const [holdLost, setHoldLost] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<CustomerField>>({});

	// Customer info
	const [email, setEmailValue] = useState('');
	const [firstName, setFirstNameValue] = useState('');
	const [lastName, setLastNameValue] = useState('');
	// Editing a field clears its error.
	const clearFieldError = useCallback((field: CustomerField) => setFieldErrors((f) => (f[field] ? { ...f, [field]: undefined } : f)), []);
	const setEmail = useCallback(
		(v: string) => {
			setEmailValue(v);
			clearFieldError('email');
		},
		[clearFieldError],
	);
	const setFirstName = useCallback(
		(v: string) => {
			setFirstNameValue(v);
			clearFieldError('firstName');
		},
		[clearFieldError],
	);
	const setLastName = useCallback(
		(v: string) => {
			setLastNameValue(v);
			clearFieldError('lastName');
		},
		[clearFieldError],
	);
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [prefilled, setPrefilled] = useState(false);

	// Pre-fill from session
	useEffect(() => {
		if (session?.customer && !prefilled) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmailValue(session.customer.email);
			if (session.customer.firstName) setFirstNameValue(session.customer.firstName);
			if (session.customer.lastName) setLastNameValue(session.customer.lastName);
			setPrefilled(true);
		}
	}, [session, prefilled]);

	// Questions (cart-scoped) and payment providers (cart-aware) both load in
	// parallel via SWR — independent of the customer-save step, so there's no
	// sequential fetch waterfall. `answers` stays local to this step machine.
	const questions = useCheckoutQuestions(cartId);
	const providers = usePaymentProviders(cartId);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Payment
	const [selectedProvider, setSelectedProvider] = useState<PaymentProviderName | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// Redirect if no cart — but only once CartProvider has read the stored cart id
	// from localStorage. Before that cartId is always null, so a hard reload of
	// /checkout would otherwise bounce to /timetable.
	useEffect(() => {
		if (isLoaded && !cartId && !checkoutComplete) {
			router.replace('/timetable');
		}
	}, [isLoaded, cartId, checkoutComplete, router]);

	const cartHeaders = useCallback(
		(): Record<string, string> =>
			cartId
				? { 'X-Cart-Id': cartId, 'Content-Type': 'application/json' }
				: { 'Content-Type': 'application/json' },
		[cartId],
	);

	// Step 1: Save customer info
	const handleSaveCustomer = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setFieldErrors({});
			setSubmitting(true);

			try {
				const customerPayload: CheckoutCustomer = customerId
					? { customer: { kind: 'existing', customerId } }
					: { customer: { kind: 'new', email, firstName: firstName || undefined, lastName: lastName || undefined } };

				const res = await fetch('/api/checkout/save-customer', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(customerPayload),
				});

				if (!res.ok) {
					// The API's field errors go under the fields; only what no field shows reaches the banner.
					const err = await checkoutErrorFrom(res, 'Failed to save customer info');
					const { byField, unmapped } = mapFieldErrors(err.fieldErrors, CUSTOMER_FIELDS);
					setFieldErrors(byField);
					setError(bannerMessage(err.message, byField, unmapped, 'Failed to save customer info'));
					return;
				}

				const saveResult = await res.json();
				if (saveResult.customerId) {
					setCustomerId(saveResult.customerId);
				}

				// Questions are already loaded in parallel via SWR — just branch on them
				// (no sequential fetch here).
				setStep(questions.length > 0 ? 'questions' : 'payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[email, firstName, lastName, customerId, cartHeaders, questions.length],
	);

	// Step 2: Save question answers
	const handleSaveAnswers = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setSubmitting(true);

			try {
				// The API wants the question text alongside each answer (kept as a historical record).
				const answerArray = questions
					.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '')
					.map((q) => ({
						questionId: q.id,
						question: q.translations?.[0]?.title ?? q.internalName,
						answer: answers[q.id] as string,
					}));

				const answersPayload: CheckoutQuestionAnswers = { answers: answerArray };
				const res = await fetch('/api/checkout/save-answers', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(answersPayload),
				});

				if (!res.ok && res.status !== 204) {
					throw new Error('Failed to save answers');
				}

				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[answers, questions, cartHeaders],
	);

	// A failed start/submit: recover from the conflicts the API names, else show its message.
	const handleCheckoutFailure = useCallback(
		(err: unknown) => {
			if (err instanceof CheckoutError) {
				// A "Your details" field the API rejected: back to that step, the message under the field.
				const { byField, unmapped } = mapFieldErrors(err.fieldErrors, CUSTOMER_FIELDS);
				if (hasFieldErrors(byField)) {
					setFieldErrors(byField);
					setStep('customer');
					setError(bannerMessage(err.message, byField, unmapped, 'Checkout failed'));
					return;
				}
				if (err.code === 'CART_ALREADY_CHECKED_OUT') {
					// The cart is already an order (a second tab, a retried click): show that order.
					setCheckoutComplete(true);
					clearCart();
					router.push(err.orderId ? `/thank-you?orderId=${encodeURIComponent(err.orderId)}` : '/thank-you');
					return;
				}
				if (err.code === 'CART_EXPIRED') setHoldLost(true);
				setError(checkoutErrorCopy(err) ?? err.message);
				return;
			}
			setError(err instanceof Error ? err.message : 'An error occurred');
		},
		[clearCart, router],
	);

	// POST to a checkout route. Another start/submit of this cart still running answers 409
	// CHECKOUT_IN_PROGRESS: wait a moment and try again (twice) before giving up.
	const postCheckout = useCallback(
		async (url: string, body: unknown, fallback: string) => {
			for (let attempt = 0; ; attempt++) {
				const res = await fetch(url, { method: 'POST', headers: cartHeaders(), body: JSON.stringify(body) });
				if (res.ok) return res.json();
				const err = await checkoutErrorFrom(res, fallback);
				if (err.code !== 'CHECKOUT_IN_PROGRESS' || attempt >= IN_PROGRESS_RETRIES) throw err;
				await new Promise((r) => setTimeout(r, IN_PROGRESS_DELAY_MS));
			}
		},
		[cartHeaders],
	);

	// Step 4: Submit checkout
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setError(null);
			setSubmitting(true);

			try {
				const submitPayload: SubmitCheckout = {
					appointmentsSettings: { markAsScheduled: true },
				};
				if (stripePaymentIntentId) {
					submitPayload.stripePaymentIntentId = stripePaymentIntentId;
				}

				const data: CheckoutResponse = await postCheckout('/api/checkout/submit', submitPayload, 'Checkout failed');

				// Auto-authenticate customer if tokens returned
				if (data.auth?.accessToken) {
					await nextAuthSignIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						redirect: false,
					});
				}

				// Bank details / invoice link and the booking's status ride to the confirmation page.
				saveHandoff(data);
				setCheckoutComplete(true);
				clearCart();
				router.push(`/thank-you?orderId=${encodeURIComponent(data.order?.id ?? '')}`);
			} catch (err: unknown) {
				handleCheckoutFailure(err);
			} finally {
				setSubmitting(false);
			}
		},
		[postCheckout, clearCart, router, handleCheckoutFailure],
	);

	// Step 3: Start checkout with selected provider
	const handleStartCheckout = useCallback(
		async (providerName: PaymentProviderName) => {
			setError(null);
			setSubmitting(true);
			setSelectedProvider(providerName);

			try {
				const startPayload: StartCheckout = { provider: providerName };
				if (customerId) {
					startPayload.customer = { kind: 'existing', customerId };
				}

				const data: CheckoutStartResponse = await postCheckout('/api/checkout/start', startPayload, 'Failed to start checkout');
				setPaymentData(data);

				// Route on how the provider checks out, keyed off the RESPONSE provider: when nothing is
				// collectible the backend swaps the requested one (e.g. Stripe) for "no payment required".
				const mode = checkoutModeOf(data, providers.find((p) => p.name === data.provider) ?? providers.find((p) => p.name === providerName));
				if (mode === 'manual' || mode === 'none') {
					// Cash, bank transfer, invoice, nothing to pay: no card form, place the booking now.
					setSubmitting(false);
					await handleSubmitCheckout();
				} else if (mode === 'redirect' && data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else {
					setStep('payment');
				}
			} catch (err: unknown) {
				handleCheckoutFailure(err);
			} finally {
				setSubmitting(false);
			}
		},
		[customerId, providers, postCheckout, handleSubmitCheckout, handleCheckoutFailure],
	);

	// After a lost hold: drop the cart; the no-cart redirect takes the visitor back to the timetable.
	const restartBooking = useCallback(() => {
		setHoldLost(false);
		setError(null);
		clearCart();
	}, [clearCart]);

	const items = useMemo(() => (cart?.items ?? []) as CartItem[], [cart?.items]);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const minutes = timeRemaining !== null ? Math.floor(timeRemaining / 60) : null;
	const seconds = timeRemaining !== null ? timeRemaining % 60 : null;

	// Memoized so consumers don't re-render on every provider render from an
	// inline object identity change.
	const value = useMemo<CheckoutContextValue>(
		() => ({
			step,
			error,
			submitting,
			checkoutComplete,
			holdLost,
			fieldErrors,
			email,
			firstName,
			lastName,
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			questions,
			answers,
			setAnswers,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			minutes,
			seconds,
			setStep,
			setError,
			handleSaveCustomer,
			handleSaveAnswers,
			handleStartCheckout,
			handleSubmitCheckout,
			restartBooking,
			extendCart,
		}),
		[
			step,
			error,
			submitting,
			checkoutComplete,
			holdLost,
			fieldErrors,
			email,
			firstName,
			lastName,
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			questions,
			answers,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			minutes,
			seconds,
			handleSaveCustomer,
			handleSaveAnswers,
			handleStartCheckout,
			handleSubmitCheckout,
			restartBooking,
			extendCart,
		],
	);

	return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}
