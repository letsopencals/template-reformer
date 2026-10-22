'use client';

import { useCallback } from 'react';
import { clsx } from 'clsx';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { formatPrice } from '@/lib/format';
import type { CartWithDiscounts } from '@/types/discount';
import { cartSubtotal } from './cart-line';
import { Tag } from '@/components/ui/chip';
import { isAutomatic } from '@/lib/discount-state';

interface CartTotalsProps {
	cart: CartWithDiscounts;
	/** Show the tax line (checkout). The drawer keeps it short. */
	showTax?: boolean;
	className?: string;
}

/** Hook: a cents → currency formatter for AnimatedNumber (it rounds each frame, so tween in cents). */
export function useCentsFormatter(currency: string | undefined) {
	return useCallback((cents: number) => formatPrice(cents / 100, currency), [currency]);
}

const toCents = (n: number) => Math.round(n * 100);

/** Subtotal, applied discounts (automatic intro/off-peak offers tagged), optional tax and a live-tweening total. */
export function CartTotals({ cart, showTax = false, className }: CartTotalsProps) {
	const currency = cart.paymentCurrencyCode;
	const format = useCentsFormatter(currency);
	const subtotal = cartSubtotal(cart);
	const discounts = cart.appliedDiscounts ?? [];
	const total = cart.total ?? cart.subtotal ?? 0;

	return (
		<dl className={clsx('space-y-2.5 text-sm', className)}>
			<div className="flex items-baseline justify-between gap-4">
				<dt className="text-graphite">Subtotal</dt>
				<dd className="tabular text-ink">
					<AnimatedNumber value={toCents(subtotal)} format={format} />
				</dd>
			</div>
			{discounts.map((d) => (
				<div key={d.id} className="flex items-baseline justify-between gap-4">
					<dt className="flex min-w-0 items-baseline gap-2 text-ink">
						<span className="truncate">{d.title}</span>
						{isAutomatic(d) ? <Tag tone="neutral">Automatic</Tag> : <Tag tone="outline">{d.code}</Tag>}
					</dt>
					<dd className="tabular text-ink">−{formatPrice(d.totalAmount, currency)}</dd>
				</div>
			))}
			{showTax && cart.totalTax > 0 ? (
				<div className="flex items-baseline justify-between gap-4">
					<dt className="text-graphite">{cart.taxesIncluded ? 'Tax (included)' : 'Tax'}</dt>
					<dd className="tabular text-ink">{formatPrice(cart.totalTax, currency)}</dd>
				</div>
			) : null}
			<div className="flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
				<dt className="eyebrow text-ink">Total</dt>
				<dd className="tabular text-[1.4rem] leading-none text-ink">
					<AnimatedNumber value={toCents(total)} format={format} />
				</dd>
			</div>
		</dl>
	);
}
