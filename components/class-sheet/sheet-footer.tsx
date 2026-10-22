'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CarriageRail } from '@/components/motifs/carriage-rail';
import { formatLocalDate } from '@/lib/class-sheet';
import type { Occurrence } from '@/lib/timetable';
import { money } from '@/components/timetable/labels';
import type { BookPhase } from './use-book-class';

interface SheetFooterProps {
	occurrence: Occurrence;
	next: Occurrence | null;
	total: number;
	phase: BookPhase;
	error: string | null;
	onBook: () => void;
	onOpen: (o: Occurrence) => void;
}

/** Sticky footer: price + Book, or Full + next with space, or the held state. */
export function SheetFooter({ occurrence: o, next, total, phase, error, onBook, onOpen }: SheetFooterProps) {
	if (phase === 'held') {
		return (
			<div role="status" className="py-1">
				<p className="flex items-baseline justify-between gap-3">
					<span className="headline text-ink">Bed held.</span>
					<span className="eyebrow text-graphite">To checkout</span>
				</p>
				<HeldRail />
			</div>
		);
	}

	if (o.status === 'full') {
		return (
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-ink">
					<span className="eyebrow mr-2 text-spring-red">Full</span>
					{o.inferred ? 'Every bed is taken.' : 'No beds left.'}
				</p>
				{next ? (
					<Button variant="primary" size="md" onClick={() => onOpen(next)}>
						{formatLocalDate(next.localDate)} {next.localTime} <span aria-hidden>→</span>
					</Button>
				) : (
					<span className="text-xs text-steel">Nothing later with space in this window.</span>
				)}
			</div>
		);
	}

	const busy = phase === 'booking';
	return (
		<div>
			{error ? (
				<p role="alert" className="mb-3 border-l-2 border-spring-red bg-spring-red-soft/60 px-3 py-2 text-xs text-ink">
					{error}
				</p>
			) : null}
			<div className="flex items-center gap-4">
				<div className="shrink-0">
					<p className="eyebrow text-[0.6rem] text-graphite">{o.status === 'low' ? `${o.seatsLeft} left` : 'Total'}</p>
					<p className="tabular text-xl leading-tight text-ink">{money(total)}</p>
				</div>
				<Button variant={o.status === 'low' ? 'urgent' : 'primary'} size="lg" fullWidth onClick={onBook} disabled={busy} aria-busy={busy}>
					{busy ? 'Holding your bed…' : 'Book this class'}
				</Button>
			</div>
		</div>
	);
}

/** The carriage runs the length of the rail while we hand over to checkout. */
function HeldRail() {
	const [value, setValue] = useState(0.08);
	useEffect(() => {
		const id = window.requestAnimationFrame(() => setValue(1));
		return () => window.cancelAnimationFrame(id);
	}, []);
	return <CarriageRail value={value} className="mt-3" label="Holding your bed" />;
}
