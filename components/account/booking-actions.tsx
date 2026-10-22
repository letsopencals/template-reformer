'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { useNow } from '@/hooks/use-now';
import type { BookingView } from '@/components/account/booking-view';
import { changeWindow, policyLine } from '@/components/account/change-window';
import { CancelDialog } from '@/components/account/cancel-dialog';
import { RescheduleSheet } from '@/components/account/reschedule-sheet';

export type BookingActionKind = 'cancel' | 'reschedule';

/**
 * Move / Cancel for one booking, with the policy line under them. Buttons and
 * copy read the same `changeWindow` at the same `now` (ticks every 30 s), so
 * they flip together at the exact 12-hour cutoff. Before hydration both are
 * disabled. `initial` opens a dialog on mount (magic links `?action=`).
 */
export function BookingActions({
	view,
	onChanged,
	initial = null,
	className,
}: {
	view: BookingView;
	onChanged: () => void;
	initial?: BookingActionKind | null;
	className?: string;
}) {
	const now = useNow(30_000);
	const [open, setOpen] = useState<BookingActionKind | null>(initial);
	const w = now ? changeWindow(view.source, now.getTime()) : null;
	const line = w ? policyLine(w) : null;
	const close = () => setOpen(null);

	return (
		<div className={className}>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="outline" size="sm" disabled={!w?.reschedule.allowed} onClick={() => setOpen('reschedule')}>
					Move
				</Button>
				<Button variant="ghost" size="sm" disabled={!w?.cancel.allowed} onClick={() => setOpen('cancel')}>
					Cancel
				</Button>
			</div>
			<p className={clsx('mt-2 min-h-[1.25rem] text-xs leading-relaxed', w?.cancel.allowed ? 'text-graphite' : 'text-steel')}>{line}</p>

			<CancelDialog open={open === 'cancel'} onClose={close} view={view} action={w?.cancel ?? null} onDone={onChanged} />
			<RescheduleSheet open={open === 'reschedule'} onClose={close} view={view} action={w?.reschedule ?? null} onDone={onChanged} />
		</div>
	);
}
