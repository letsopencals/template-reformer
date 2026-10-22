'use client';

import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_CARRIAGE, EASE_EXPO } from '@/components/motion/easing';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface SheetProps {
	open: boolean;
	onClose(): void;
	/** Visible title (also the accessible name). */
	title?: ReactNode;
	/** Mono line above the title. */
	eyebrow?: ReactNode;
	'aria-label'?: string;
	/** Sticky footer (e.g. the Hold my bed button). */
	footer?: ReactNode;
	/**
	 * `auto` (default): slide-over from the right on ≥ 768px, bottom sheet below.
	 * `right` / `bottom` force one.
	 */
	side?: 'auto' | 'right' | 'bottom';
	/** Right panel width (default 520px). */
	width?: string;
	className?: string;
	initialFocus?: string;
	children: ReactNode;
}

const SCRIM = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as const;
const FADE_OFF = { opacity: 0 } as const;
const FADE_ON = { opacity: 1 } as const;
const RIGHT_OFF = { x: '100%' } as const;
const BOTTOM_OFF = { y: '100%' } as const;
const ON = { x: 0, y: 0 } as const;
// The carriage: in with a small overshoot, out with a clean exit.
const IN: Transition = { duration: 0.6, ease: EASE_CARRIAGE };
const OUT: Transition = { duration: 0.35, ease: EASE_EXPO };
const SCRIM_TRANSITION: Transition = { duration: 0.25 };

/**
 * The class sheet: a slide-over from the right on desktop, a bottom sheet on
 * phones. Portalled; scrim z-65, panel z-66 (DESIGN.md). Scroll-locks the page
 * and Lenis, traps focus, Escape closes. The body scrolls natively
 * (`data-lenis-prevent`).
 */
export function Sheet({
	open,
	onClose,
	title,
	eyebrow,
	'aria-label': ariaLabel,
	footer,
	side = 'auto',
	width = '520px',
	className,
	initialFocus,
	children,
}: SheetProps) {
	const mounted = useMounted();
	const reduce = useReducedMotion();
	const wide = useMediaQuery('(min-width: 768px)');
	const panelRef = useRef<HTMLDivElement>(null);
	useModalOverlay(open, onClose, panelRef, initialFocus);
	if (!mounted) return null;

	const right = side === 'right' || (side === 'auto' && wide);
	const off = reduce ? FADE_OFF : right ? RIGHT_OFF : BOTTOM_OFF;
	const on = reduce ? FADE_ON : ON;

	return createPortal(
		<AnimatePresence>
			{open ? (
				<>
					<motion.div key="scrim" aria-hidden className="fixed inset-0 z-[65] bg-ink/40" {...SCRIM} transition={SCRIM_TRANSITION} onClick={onClose} />
					<motion.div
						key="panel"
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label={typeof title === 'string' ? title : ariaLabel}
						tabIndex={-1}
						initial={off}
						animate={{ ...on, transition: reduce ? SCRIM_TRANSITION : IN }}
						exit={{ ...off, transition: reduce ? SCRIM_TRANSITION : OUT }}
						style={right ? { width: `min(100vw, ${width})` } : undefined}
						className={clsx(
							'fixed z-[66] flex flex-col bg-paper text-ink shadow-float outline-none',
							right ? 'inset-y-0 right-0' : 'inset-x-0 bottom-0 max-h-[92svh] rounded-t-[4px]',
							className,
						)}
					>
						<div className="relative flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-7">
							{!right ? <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-[2px] bg-concrete" /> : null}
							<div className="min-w-0 pt-1">
								{eyebrow ? <p className="eyebrow text-graphite">{eyebrow}</p> : null}
								{title ? <h2 className="display-sm mt-1.5">{title}</h2> : null}
							</div>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] text-graphite transition-colors hover:bg-plaster hover:text-ink"
							>
								<svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
									<path d="M2 2l10 10M12 2 2 12" />
								</svg>
							</button>
						</div>
						<div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
							{children}
						</div>
						{footer ? <div className="border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">{footer}</div> : null}
					</motion.div>
				</>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}
