'use client';

import { AnimatePresence, motion, type PanInfo, type Transition } from 'framer-motion';
import type { Occurrence } from '@/lib/timetable';
import { timeOfDay } from '@/lib/timetable';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_CARRIAGE } from '@/components/motion/easing';
import { OccurrenceRow } from './occurrence-row';
import { BANDS } from './bands';

const SWIPE_PX = 60;
const SLIDE: Transition = { duration: 0.45, ease: EASE_CARRIAGE };
const FADE: Transition = { duration: 0.15 };
const DRAG_CONSTRAINTS = { left: 0, right: 0 } as const;

interface DayViewProps {
	date: string;
	occurrences: Occurrence[];
	/** -1 when moving back a day, 1 forward. */
	direction: number;
	onSwipe: (step: -1 | 1) => void;
	nextFor: (o: Occurrence) => Occurrence | null;
	instructorName: (o: Occurrence) => string | undefined;
	onOpen: (o: Occurrence) => void;
	empty: React.ReactNode;
}

/** Mobile: one day at a time; swipe left or right to change day. */
export function DayView({ date, occurrences, direction, onSwipe, nextFor, instructorName, onOpen, empty }: DayViewProps) {
	const reduce = useReducedMotion();
	const onDragEnd = (_: unknown, info: PanInfo) => {
		if (info.offset.x < -SWIPE_PX) onSwipe(1);
		else if (info.offset.x > SWIPE_PX) onSwipe(-1);
	};

	return (
		<div className="overflow-hidden">
			<AnimatePresence mode="wait" initial={false} custom={direction}>
				<motion.div
					key={date}
					custom={direction}
					initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 48 }}
					animate={{ opacity: 1, x: 0 }}
					exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -48 }}
					transition={reduce ? FADE : SLIDE}
					drag="x"
					dragConstraints={DRAG_CONSTRAINTS}
					dragElastic={0.18}
					dragDirectionLock
					onDragEnd={onDragEnd}
					className="touch-pan-y"
				>
					{occurrences.length === 0 ? (
						empty
					) : (
						BANDS.map((band) => {
							const items = occurrences.filter((o) => timeOfDay(o.localTime) === band.key);
							if (items.length === 0) return null;
							return (
								<section key={band.key} aria-label={band.label} className="mt-6 first:mt-2">
									<h3 className="eyebrow flex items-baseline justify-between border-b border-ink pb-2 text-ink">
										{band.label}
										<span className="tabular text-steel normal-case tracking-normal">{band.hint}</span>
									</h3>
									<ul className="divide-y divide-line">
										{items.map((o) => (
											<OccurrenceRow
												key={o.key}
												occurrence={o}
												next={o.status === 'full' ? nextFor(o) : null}
												instructorName={instructorName(o)}
												onOpen={onOpen}
											/>
										))}
									</ul>
								</section>
							);
						})
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
