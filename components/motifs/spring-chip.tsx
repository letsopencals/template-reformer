import { clsx } from 'clsx';
import { siteConfig, type Spring } from '@/lib/site-config';

/** CSS colour token per spring (for `style` / SVG). */
export const SPRING_VAR: Record<Spring, string> = {
	green: 'var(--color-spring-green)',
	yellow: 'var(--color-spring-yellow)',
	blue: 'var(--color-spring-blue)',
	red: 'var(--color-spring-red)',
};

/** Tailwind classes per spring, for when a class string is easier. */
export const SPRING_CLASSES: Record<Spring, { bg: string; text: string; soft: string; border: string }> = {
	green: { bg: 'bg-spring-green', text: 'text-spring-green', soft: 'bg-spring-green-soft', border: 'border-spring-green' },
	yellow: { bg: 'bg-spring-yellow', text: 'text-spring-yellow', soft: 'bg-spring-yellow-soft', border: 'border-spring-yellow' },
	blue: { bg: 'bg-spring-blue', text: 'text-spring-blue', soft: 'bg-spring-blue-soft', border: 'border-spring-blue' },
	red: { bg: 'bg-spring-red', text: 'text-spring-red', soft: 'bg-spring-red-soft', border: 'border-spring-red' },
};

/** A small coiled reformer spring, drawn in its spring colour. Decorative. */
export function SpringCoil({ spring, className, coils = 5 }: { spring: Spring; className?: string; coils?: number }) {
	const w = 6 + coils * 5;
	const path = ['M1 6 H4'];
	for (let i = 0; i < coils; i++) {
		const x = 4 + i * 5;
		path.push(`L${x + 1.25} 1.5 L${x + 3.75} 10.5 L${x + 5} 6`);
	}
	path.push(`H${w - 1}`);
	return (
		<svg aria-hidden viewBox={`0 0 ${w} 12`} className={clsx('h-3 w-auto shrink-0', className)} fill="none">
			<path d={path.join(' ')} stroke={SPRING_VAR[spring]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/**
 * Spring chip: coil + intensity label ("Gentle", "Strong"...). `label="level"`
 * shows the spring name instead ("Blue spring").
 */
export function SpringChip({
	spring,
	label = 'intensity',
	text,
	className,
}: {
	spring: Spring;
	label?: 'intensity' | 'spring' | 'none';
	/** Overrides the label text (e.g. "Level 2"). */
	text?: string;
	className?: string;
}) {
	const info = siteConfig.springs[spring];
	const content = text ?? (label === 'spring' ? info.label : label === 'intensity' ? info.intensity : null);
	return (
		<span className={clsx('inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink', className)} title={info.meaning}>
			<SpringCoil spring={spring} />
			{content ? <span>{content}</span> : <span className="sr-only">{info.meaning}</span>}
		</span>
	);
}
