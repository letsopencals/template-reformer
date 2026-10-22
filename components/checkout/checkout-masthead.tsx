'use client';

import Link from 'next/link';
import { motion, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';

const MASK_INITIAL = { y: '105%' };
const MASK_ANIMATE = { y: '0%' };
const FADE_INITIAL = { opacity: 0, y: 8 };
const FADE_ANIMATE = { opacity: 1, y: 0 };
const TITLE_TRANSITION: Transition = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 };
const META_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_OUT, delay: 0.35 };

/** "Nº 04 — Checkout" masthead. */
export function CheckoutMasthead() {
	const reduce = useReducedMotion();
	return (
		<header className="border-b border-line pb-8 sm:pb-10">
			<div className="flex items-baseline justify-between gap-6">
				<p className="eyebrow text-graphite">
					<span className="tabular text-steel">Nº 04</span> — Checkout
				</p>
				<Link href="/timetable" className="eyebrow link-underline text-graphite hover:text-ink">
					<span aria-hidden>← </span>The Menu
				</Link>
			</div>
			<h1 className="display-lg mt-6 overflow-hidden pb-[0.08em] text-ink">
				<motion.span
					className="block"
					initial={reduce ? false : MASK_INITIAL}
					animate={MASK_ANIMATE}
					transition={TITLE_TRANSITION}
				>
					Hold your <em>bed</em>
				</motion.span>
			</h1>
			<motion.p
				className="mt-4 max-w-[46ch] text-sm leading-relaxed text-graphite"
				initial={reduce ? false : FADE_INITIAL}
				animate={FADE_ANIMATE}
				transition={META_TRANSITION}
			>
				A few short steps. Your times are held while you finish — extend the hold if you need a moment longer.
			</motion.p>
		</header>
	);
}
