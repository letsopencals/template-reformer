'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { FieldError, Input } from '@/components/ui/input';
import { errorId, fieldAria } from '@/lib/field-errors';
import { Field } from './field';
import { DETAILS_FORM_ID } from './form-ids';

/** Input ids of the details fields. */
const INPUT_IDS = { email: 'checkout-email', firstName: 'checkout-first-name', lastName: 'checkout-last-name' } as const;

/** 01 — Your details. Submits through the context's handleSaveCustomer. */
export function CustomerStep() {
	const {
		email,
		firstName,
		lastName,
		customerId,
		setEmail,
		setFirstName,
		setLastName,
		submitting,
		isExpired,
		handleSaveCustomer,
		fieldErrors: fe,
	} = useCheckout();

	// A submit came back with a field rejected: put the cursor in the first one (not while typing).
	const wasSubmitting = useRef(false);
	useEffect(() => {
		if (wasSubmitting.current && !submitting) {
			const first = (['email', 'firstName', 'lastName'] as const).find((f) => fe[f]?.length);
			if (first) document.getElementById(INPUT_IDS[first])?.focus();
		}
		wasSubmitting.current = submitting;
	}, [submitting, fe]);

	return (
		<form id={DETAILS_FORM_ID} onSubmit={handleSaveCustomer} className="space-y-6">
			{customerId ? null : (
				<p className="text-sm text-graphite">
					Booked with us before?{' '}
					<Link href="/login?callbackUrl=/checkout" className="link-underline text-ink hover:text-ink">
						Sign in
					</Link>{' '}
					and we&rsquo;ll fill this in.
				</p>
			)}
			<Field htmlFor="checkout-email" label="Email" required>
				<Input
					id="checkout-email"
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.de"
					{...fieldAria(INPUT_IDS.email, fe.email)}
				/>
				<FieldError id={errorId(INPUT_IDS.email)} messages={fe.email} />
			</Field>
			<div className="grid gap-6 sm:grid-cols-2">
				<Field htmlFor="checkout-first-name" label="First name">
					<Input
						id="checkout-first-name"
						type="text"
						autoComplete="given-name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="Lea"
						{...fieldAria(INPUT_IDS.firstName, fe.firstName)}
					/>
					<FieldError id={errorId(INPUT_IDS.firstName)} messages={fe.firstName} />
				</Field>
				<Field htmlFor="checkout-last-name" label="Last name">
					<Input
						id="checkout-last-name"
						type="text"
						autoComplete="family-name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Schneider"
						{...fieldAria(INPUT_IDS.lastName, fe.lastName)}
					/>
					<FieldError id={errorId(INPUT_IDS.lastName)} messages={fe.lastName} />
				</Field>
			</div>
			<p className="text-xs leading-relaxed text-graphite">
				Your confirmation and a reminder the day before go here. Nothing else unless you ask.
			</p>
			<Button
				type="submit"
				variant="primary"
				size="lg"
				className="max-lg:hidden"
				disabled={submitting || !email || isExpired}
			>
				{submitting ? 'Saving…' : 'Continue'}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}
