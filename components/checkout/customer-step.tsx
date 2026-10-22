'use client';

import Link from 'next/link';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from './field';
import { DETAILS_FORM_ID } from './form-ids';

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
	} = useCheckout();

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
				/>
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
					/>
				</Field>
				<Field htmlFor="checkout-last-name" label="Last name">
					<Input
						id="checkout-last-name"
						type="text"
						autoComplete="family-name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Schneider"
					/>
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
