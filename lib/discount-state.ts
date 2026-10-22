import type { AppliedDiscount } from '@/types/discount';

/**
 * Discounts never combine: the best single one wins per line. When an
 * automatic discount (intro, off-peak) beats an entered code, the backend
 * still accepts the code (`appliedDiscountCode` is set) but it is absent
 * from `appliedDiscounts`. That's "a better offer is already applied", not an
 * active code.
 */
export type CodeState = { status: 'none' } | { status: 'active'; code: string } | { status: 'outranked'; code: string };

export function codeState(cart: { appliedDiscountCode?: string | null; appliedDiscounts?: AppliedDiscount[] | null } | null): CodeState {
	const code = cart?.appliedDiscountCode?.trim();
	if (!code) return { status: 'none' };
	const used = (cart?.appliedDiscounts ?? []).some((d) => d.code && d.code.toLowerCase() === code.toLowerCase());
	return used ? { status: 'active', code } : { status: 'outranked', code };
}

/** Automatic discounts carry no code. */
export function isAutomatic(d: Pick<AppliedDiscount, 'code'>): boolean {
	return !d.code;
}
