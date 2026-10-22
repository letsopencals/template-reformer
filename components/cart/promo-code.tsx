'use client';

import { useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { codeState } from '@/lib/discount-state';

/**
 * Compact promo-code group shared by the drawer and /checkout. Collapsed to a
 * single "Have a code?" line until opened; shows the applied code as a chip
 * with Remove once accepted.
 */
export function PromoCode({ className }: { className?: string }) {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError, clearDiscountCodeError } = useCart();
	const [open, setOpen] = useState(false);
	const [code, setCode] = useState('');
	const [pending, setPending] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const errorId = useId();

	const state = codeState(cart);

	const handleApply = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const trimmed = code.trim();
		if (!trimmed) return;
		setPending(true);
		try {
			const ok = await applyDiscountCode(trimmed);
			if (ok) {
				setCode('');
				setOpen(false);
			}
		} finally {
			setPending(false);
		}
	};

	const handleToggle = () => {
		clearDiscountCodeError();
		setOpen((v) => !v);
		if (!open) setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleRemove = async () => {
		setPending(true);
		try {
			await removeDiscountCode();
		} finally {
			setPending(false);
		}
	};

	if (state.status !== 'none') {
		const outranked = state.status === 'outranked';
		return (
			<div className={className}>
			<div className="flex items-center justify-between gap-3">
				<span className="eyebrow text-graphite">Code</span>
				<span className="flex items-center gap-3">
					<span className={clsx('tabular rounded-[2px] border border-dashed px-2.5 py-1 text-xs uppercase', outranked ? 'border-concrete text-steel line-through' : 'border-steel text-ink')}>
						{state.code}
					</span>
					<button
						type="button"
						onClick={handleRemove}
						disabled={pending}
						className="text-xs text-graphite underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-50"
					>
						Remove
					</button>
				</span>
			</div>
			{outranked ? (
				<p role="status" className="mt-2 text-xs leading-relaxed text-graphite">
					A better offer is already applied. Offers don&rsquo;t stack, so you get the bigger one.
				</p>
			) : null}
			</div>
		);
	}

	return (
		<div className={className}>
			<button
				type="button"
				onClick={handleToggle}
				aria-expanded={open}
				className="group flex items-center gap-2 text-xs text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			>
				<span className={clsx('tabular inline-block transition-transform duration-300', open && 'rotate-45')} aria-hidden>
					+
				</span>
				<span className="link-underline">{open ? 'Hide the code field' : 'Have a code?'}</span>
			</button>
			{open ? (
				<form onSubmit={handleApply} className="mt-3 flex">
					<label htmlFor={inputId} className="sr-only">
						Promo code
					</label>
					<input
						id={inputId}
						ref={inputRef}
						type="text"
						value={code}
						autoComplete="off"
						spellCheck={false}
						onChange={(e) => {
							setCode(e.target.value);
							if (discountCodeError) clearDiscountCodeError();
						}}
						aria-invalid={discountCodeError ? true : undefined}
						aria-describedby={discountCodeError ? errorId : undefined}
						placeholder="Enter code"
						className="tabular min-w-0 flex-1 rounded-l-[2px] border border-r-0 border-line bg-paper px-3 py-2.5 text-sm uppercase text-ink outline-none placeholder:normal-case placeholder:text-steel focus:border-ink focus:bg-white aria-[invalid=true]:border-spring-red"
					/>
					<button
						type="submit"
						disabled={pending || !code.trim()}
						className="eyebrow rounded-r-[2px] border border-ink bg-ink px-4 text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-45"
					>
						{pending ? '…' : 'Apply'}
					</button>
				</form>
			) : null}
			{discountCodeError ? (
				<p id={errorId} role="alert" className="mt-2 text-xs text-spring-red">
					{discountCodeError.message ?? 'That code doesn’t work here.'}
				</p>
			) : null}
		</div>
	);
}
