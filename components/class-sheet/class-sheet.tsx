'use client';

import { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { useNow } from '@/hooks/use-now';
import { formatLocalDate, sameTimeNextWeek } from '@/lib/class-sheet';
import type { Occurrence } from '@/lib/timetable';
import type { TimetableLookup } from '@/lib/timetable-lookup';
import { classShort, roomOf } from '@/components/timetable/labels';
import { SheetHero } from './sheet-hero';
import { SheetFacts } from './sheet-facts';
import { RoomBlock } from './room-block';
import { TeacherCard } from './teacher-card';
import { PolicyNote } from './policy-note';
import { AddOnStepper } from './add-on-stepper';
import { PricePanel } from './price-panel';
import { SheetFooter } from './sheet-footer';
import { useClassAddOns } from './use-class-add-ons';
import { useBookClass } from './use-book-class';

export interface ClassSheetProps {
	occurrence: Occurrence | null;
	all: Occurrence[];
	lookup: TimetableLookup;
	onClose: () => void;
	onOpenOccurrence: (o: Occurrence) => void;
	nextFor: (o: Occurrence) => Occurrence | null;
}

/**
 * One class, everything about it, and Book. Booking holds the bed in the cart
 * (with the chosen extras) and hands over to /checkout for details, questions
 * and payment.
 */
export function ClassSheet({ occurrence, all, lookup, onClose, onOpenOccurrence, nextFor }: ClassSheetProps) {
	// Keep the last occurrence while the sheet animates out.
	const [shown, setShown] = useState<Occurrence | null>(occurrence);
	if (occurrence && occurrence !== shown) setShown(occurrence);
	const o = occurrence ?? shown;

	const reduce = useReducedMotion();
	const now = useNow(30_000);
	const addOns = useClassAddOns(o);
	const { phase, error, book, reset } = useBookClass();
	// A different class starts clean (an old error doesn't follow it).
	const [lastKey, setLastKey] = useState<string | null>(o?.key ?? null);
	if (o && o.key !== lastKey) {
		setLastKey(o.key);
		if (phase === 'error') reset();
	}

	const details = useMemo(() => {
		if (!o) return null;
		const series = lookup.series[o.seriesId];
		const cls = lookup.classes.find((c) => c.key === o.classKey) ?? null;
		const teacher = lookup.instructors.find((i) => i.id === o.instructorId) ?? null;
		return {
			series,
			cls,
			teacher,
			image: series?.images[0] ?? cls?.images[0] ?? null,
			room: series?.room ?? roomOf(o),
			nextWeek: sameTimeNextWeek(o, all),
		};
	}, [o, lookup, all]);

	if (!o || !details) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

	const onBook = () => void book(o, addOns.selected, reduce);
	const nw = details.nextWeek;

	return (
		<Sheet
			open={occurrence !== null}
			onClose={phase === 'booking' || phase === 'held' ? noop : onClose}
			eyebrow={o.title !== classShort(o) ? o.title : o.level}
			title={classShort(o)}
			footer={<SheetFooter occurrence={o} next={o.status === 'full' ? nextFor(o) : null} total={o.price + addOns.total} phase={phase} error={error} onBook={onBook} onOpen={onOpenOccurrence} />}
		>
			<SheetHero occurrence={o} image={details.image} title={o.title} />
			<SheetFacts occurrence={o} cls={details.cls} teacher={details.teacher?.name ?? null} />
			<RoomBlock occurrence={o} room={details.room} />
			{o.status !== 'full' && (addOns.loading || addOns.addOns.length > 0) ? (
				<section className="mt-8">
					<p className="eyebrow mb-3 text-graphite">Extras</p>
					<AddOnStepper addOns={addOns.addOns} selected={addOns.selected} loading={addOns.loading} onChange={addOns.setQuantity} disabled={phase === 'booking'} />
				</section>
			) : null}
			{o.status !== 'full' ? <PricePanel occurrence={o} addOnsTotal={addOns.total} /> : null}
			<PolicyNote start={o.start} gapSeconds={details.series?.cancelGap ?? 0} now={now?.getTime() ?? null} />
			{details.teacher ? <TeacherCard teacher={details.teacher} /> : null}
			<p className="mt-8 border-t border-line pt-5 text-sm">
				{nw.occurrence ? (
					<button type="button" onClick={() => onOpenOccurrence(nw.occurrence!)} className="link-underline text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
						Same time next week: {formatLocalDate(nw.date)} <span aria-hidden>→</span>
					</button>
				) : (
					<span className="text-graphite">
						Same time next week ({formatLocalDate(nw.date)}):{' '}
						{all.some((x) => x.localDate >= nw.date) ? 'not on the timetable.' : 'opens for booking soon.'}
					</span>
				)}
			</p>
		</Sheet>
	);
}

function noop() {}
