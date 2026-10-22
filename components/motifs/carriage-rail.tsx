'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { clsx } from 'clsx';
import { SPRING_CARRIAGE } from '@/components/motion/easing';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';

/**
 * The carriage rail: a hairline rail with a small "carriage" block riding it.
 * Use it as a progress indicator (`value` 0–1, e.g. the cart hold timer or a
 * wizard step) or bind it to scroll with `progress` (a MotionValue 0–1 from
 * `useScrollProgress`). The carriage settles with a slight overshoot.
 */
export function CarriageRail({
	value,
	progress,
	tone = 'ink',
	className,
	label,
}: {
	value?: number;
	progress?: MotionValue<number>;
	tone?: 'ink' | 'red';
	className?: string;
	/** Accessible label; when set the rail is a progressbar. */
	label?: string;
}) {
	const reduce = useReducedMotion();
	const pct = Math.max(0, Math.min(1, value ?? 0));
	const color = tone === 'red' ? 'bg-spring-red' : 'bg-ink';
	return (
		<div
			className={clsx('relative h-3 w-full', className)}
			{...(label ? { role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pct * 100) } : { 'aria-hidden': true })}
		>
			<span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-concrete" />
			{progress ? (
				<ProgressCarriage progress={progress} color={color} />
			) : (
				<>
					<motion.span
						className={clsx('absolute top-1/2 left-0 h-px origin-left -translate-y-1/2', color)}
						style={{ width: '100%' }}
						initial={false}
						animate={{ scaleX: pct }}
						transition={reduce ? { duration: 0 } : SPRING_CARRIAGE}
					/>
					<motion.span
						className={clsx('absolute top-1/2 h-3 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[2px]', color)}
						initial={false}
						animate={{ left: `${pct * 100}%` }}
						transition={reduce ? { duration: 0 } : SPRING_CARRIAGE}
					/>
				</>
			)}
		</div>
	);
}

function ProgressCarriage({ progress, color }: { progress: MotionValue<number>; color: string }) {
	const left = useTransform(progress, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);
	return (
		<>
			<motion.span className={clsx('absolute top-1/2 left-0 h-px w-full origin-left -translate-y-1/2', color)} style={{ scaleX: progress }} />
			<motion.span className={clsx('absolute top-1/2 h-3 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[2px]', color)} style={{ left }} />
		</>
	);
}
