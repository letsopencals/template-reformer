'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT, VIEWPORT_ONCE } from '@/components/motion/easing';

const HIDDEN = { pathLength: 0 } as const;
const SHOWN = { pathLength: 1 } as const;

/**
 * A hairline "tension cable" that draws on when scrolled into view. Straight by
 * default; `sag` (px) bows it like a cable under load. Decorative.
 */
export function TensionCable({
	className,
	sag = 0,
	delay = 0,
	strokeOpacity = 0.25,
}: {
	className?: string;
	sag?: number;
	delay?: number;
	strokeOpacity?: number;
}) {
	const reduce = useReducedMotion();
	const d = sag ? `M0 1 Q 500 ${1 + sag} 1000 1` : 'M0 1 H1000';
	return (
		<svg aria-hidden viewBox={`0 0 1000 ${2 + Math.abs(sag)}`} preserveAspectRatio="none" className={clsx('block h-[2px] w-full overflow-visible', className)}>
			<motion.path
				d={d}
				fill="none"
				stroke="var(--color-ink)"
				strokeOpacity={strokeOpacity}
				strokeWidth="1"
				vectorEffect="non-scaling-stroke"
				initial={reduce ? false : HIDDEN}
				whileInView={SHOWN}
				viewport={VIEWPORT_ONCE}
				transition={{ duration: DURATION.drive, ease: EASE_OUT, delay }}
			/>
		</svg>
	);
}
