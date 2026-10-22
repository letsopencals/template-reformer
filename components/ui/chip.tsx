import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	selected?: boolean;
	size?: 'sm' | 'md';
}

/**
 * Toggle/filter chip (timetable filters, day pickers, instructor pickers).
 * Mono label, 2px radius; selected = ink fill. Sets `aria-pressed`.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
	{ selected = false, size = 'md', className, type = 'button', ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			type={type}
			aria-pressed={selected}
			className={clsx(
				'inline-flex items-center gap-2 rounded-[2px] border font-mono uppercase tracking-[0.08em] whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40',
				size === 'sm' ? 'h-8 px-2.5 text-[0.68rem]' : 'h-10 px-3.5 text-[0.72rem]',
				selected ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink',
				className,
			)}
			{...props}
		/>
	);
});

/** Static label tag (status, level, "Off-peak"). Not interactive. */
export function Tag({
	children,
	tone = 'neutral',
	className,
}: {
	children: React.ReactNode;
	tone?: 'neutral' | 'ink' | 'red' | 'green' | 'yellow' | 'blue' | 'outline';
	className?: string;
}) {
	const tones = {
		neutral: 'bg-plaster-deep text-graphite',
		ink: 'bg-ink text-paper',
		outline: 'border border-line text-graphite',
		red: 'bg-spring-red-soft text-spring-red',
		green: 'bg-spring-green-soft text-[#2b6e4b]',
		yellow: 'bg-spring-yellow-soft text-[#7a5d0e]',
		blue: 'bg-spring-blue-soft text-spring-blue',
	} as const;
	return (
		<span className={clsx('inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em]', tones[tone], className)}>
			{children}
		</span>
	);
}
