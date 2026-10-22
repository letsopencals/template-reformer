'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

export interface FaqItem {
	q: string;
	a: string;
}

const OPEN = { height: 'auto', opacity: 1 } as const;
const CLOSED = { height: 0, opacity: 0 } as const;
const TRANSITION = { duration: 0.35, ease: EASE_OUT } as const;

/** Hairline-ruled FAQ list. One item open at a time. */
export function FaqAccordion({ items, defaultOpen = 0 }: { items: FaqItem[]; defaultOpen?: number | null }) {
	const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
	const reduce = useReducedMotion();
	const baseId = useId();

	return (
		<div className="border-t border-line">
			{items.map((item, i) => {
				const isOpen = openIndex === i;
				const panelId = `${baseId}-${i}`;
				return (
					<div key={item.q} className="border-b border-line">
						<button
							type="button"
							onClick={() => setOpenIndex(isOpen ? null : i)}
							aria-expanded={isOpen}
							aria-controls={panelId}
							className="flex w-full items-center justify-between gap-6 py-5 text-left"
						>
							<span className="headline text-lg text-ink">{item.q}</span>
							<span aria-hidden className={`relative h-3 w-3 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
								<span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink" />
								<span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink" />
							</span>
						</button>
						<AnimatePresence initial={false}>
							{isOpen ? (
								<motion.div
									id={panelId}
									initial={reduce ? false : CLOSED}
									animate={OPEN}
									exit={reduce ? undefined : CLOSED}
									transition={TRANSITION}
									className="overflow-hidden"
								>
									<p className="max-w-3xl pb-6 leading-relaxed text-graphite">{item.a}</p>
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
}
