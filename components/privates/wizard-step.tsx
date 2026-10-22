'use client';

import { memo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_CARRIAGE, EASE_OUT } from '@/components/motion/easing';

export type StepState = 'active' | 'done' | 'locked';

const OPEN = { height: 'auto', opacity: 1 } as const;
const CLOSED = { height: 0, opacity: 0 } as const;
const MOTION = { height: { duration: 0.5, ease: EASE_CARRIAGE }, opacity: { duration: 0.3, ease: EASE_OUT } } as const;
const STILL = { duration: 0 } as const;

/**
 * One wizard step: a numbered row on a hairline. Done steps collapse to their
 * answer with a "Change" link; the active step opens below; later steps wait
 * dimmed. Focus moves to a step's heading when it opens (after the first).
 */
export const WizardStep = memo(function WizardStep({
	index,
	title,
	state,
	answer,
	onEdit,
	children,
}: {
	index: number;
	title: string;
	state: StepState;
	answer?: string | null;
	onEdit: () => void;
	children: React.ReactNode;
}) {
	const reduce = useReducedMotion();
	const headingRef = useRef<HTMLHeadingElement>(null);
	const wasActive = useRef(state === 'active');
	useEffect(() => {
		if (state === 'active' && !wasActive.current) headingRef.current?.focus({ preventScroll: false });
		wasActive.current = state === 'active';
	}, [state]);

	const id = `private-step-${index}`;
	return (
		<section aria-labelledby={id} className="border-t border-line">
			<div className="flex items-baseline gap-4 py-5 sm:gap-6">
				<span className={clsx('tabular w-7 shrink-0 text-sm', state === 'locked' ? 'text-concrete' : 'text-steel')}>{String(index + 1).padStart(2, '0')}</span>
				<div className="min-w-0 flex-1">
					<h2 id={id} ref={headingRef} tabIndex={-1} className={clsx('headline text-xl outline-none sm:text-2xl', state === 'locked' ? 'text-concrete' : 'text-ink')}>
						{title}
					</h2>
					{state === 'done' && answer ? <p className="mt-1 truncate text-graphite">{answer}</p> : null}
				</div>
				{state === 'done' ? (
					<button type="button" onClick={onEdit} className="link-underline eyebrow shrink-0 text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink" aria-label={`Change ${title.toLowerCase()}`}>
						Change
					</button>
				) : null}
			</div>
			<AnimatePresence initial={false}>
				{state === 'active' ? (
					<motion.div key="body" initial={CLOSED} animate={OPEN} exit={CLOSED} transition={reduce ? STILL : MOTION} className="overflow-hidden">
						<div className="pb-10 sm:pl-[3.25rem]">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</section>
	);
});
