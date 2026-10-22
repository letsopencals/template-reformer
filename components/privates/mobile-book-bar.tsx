'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { SPRING_CARRIAGE } from '@/components/motion/easing';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';

const HIDDEN = { y: '110%' } as const;
const SHOWN = { y: 0 } as const;

/** Below `lg` the booking card sits under the steps; this bar keeps the action in reach once a time is picked. */
export function MobileBookBar({ show, when, total, currency, pending, error, onBook }: { show: boolean; when: string | null; total: number; currency: string; pending: boolean; error: string | null; onBook: () => void }) {
	const reduce = useReducedMotion();
	return (
		<AnimatePresence>
			{show ? (
				<motion.div
					initial={reduce ? false : HIDDEN}
					animate={SHOWN}
					exit={reduce ? undefined : HIDDEN}
					transition={SPRING_CARRIAGE}
					className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-plaster/95 px-4 py-3 backdrop-blur-md lg:hidden"
				>
					<div className="mx-auto flex max-w-xl items-center gap-4">
						<div className="min-w-0 flex-1">
							{error ? <p role="alert" className="text-sm text-spring-red">{error}</p> : <p className="truncate text-sm text-ink">{when}</p>}
							<p className="tabular text-sm text-graphite">{formatPrice(total, currency)}</p>
						</div>
						<Button onClick={onBook} disabled={pending} aria-busy={pending}>
							{pending ? 'Holding…' : 'Add to cart'}
						</Button>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
