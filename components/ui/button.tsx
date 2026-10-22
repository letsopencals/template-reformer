import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'inverse' | 'urgent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
}

/**
 * Tensile buttons are squared-ish (2px radius), ink-filled instruments with a
 * mono-free Archivo label. They never use spring colours, except `urgent`
 * (spring red), reserved for "last beds" moments.
 *
 * - `primary`: ink fill, paper text. The one main action per view.
 * - `outline`: 1px ink border on transparent.
 * - `ghost`: text only with an underline on hover.
 * - `inverse`: paper fill for use on ink/photo backgrounds.
 * - `urgent`: spring red fill (last beds left). Use sparingly.
 *
 * There's no tailwind-merge: don't pass `hidden`/`flex` overrides via
 * className (the base `inline-flex` wins). Use `max-sm:hidden` etc.
 */
const BASE =
	'inline-flex items-center justify-center gap-2 rounded-[2px] font-semibold tracking-[-0.005em] whitespace-nowrap transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-carriage)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-45';

const VARIANTS: Record<ButtonVariant, string> = {
	primary: 'bg-ink text-paper hover:bg-ink-soft',
	outline: 'border border-ink text-ink hover:bg-ink hover:text-paper',
	ghost: 'text-ink underline-offset-4 hover:underline',
	inverse: 'bg-paper text-ink hover:bg-white',
	urgent: 'bg-spring-red text-white hover:brightness-95',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-9 px-4 text-[0.85rem]',
	md: 'h-11 px-5 text-[0.95rem]',
	lg: 'h-14 px-7 text-base',
};

export interface ButtonClassOptions {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	className?: string;
}

/**
 * Class string for `next/link` anchors that should look like a Button (Button
 * renders a <button>). `<Link href="/timetable" className={buttonClasses({ size: 'lg' })}>`
 */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth, className }: ButtonClassOptions = {}): string {
	return clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...props },
	ref,
) {
	return <button ref={ref} type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...props} />;
});
