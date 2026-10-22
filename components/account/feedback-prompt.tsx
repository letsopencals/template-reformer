'use client';

import { useState } from 'react';
import { SpringChip } from '@/components/motifs/spring-chip';
import { Button } from '@/components/ui/button';
import { shortTitle, type BookingView } from '@/components/account/booking-view';
import { FeedbackDialog } from '@/components/account/feedback-dialog';

const WINDOW_MS = 7 * 86_400_000;

/** The most recent class from the last 7 days that this browser hasn't rated. */
export function pickFeedbackTarget(past: BookingView[], rated: Set<string>, now: number): BookingView | null {
	return past.find((v) => now - v.end < WINDOW_MS && !rated.has(v.id)) ?? null;
}

/** "How was Flow with Lena?" strip at the top of the account, after a recent class. */
export function FeedbackPrompt({ target, onRated }: { target: BookingView; onRated: (id: string) => void }) {
	const [open, setOpen] = useState(false);
	const [sent, setSent] = useState(false);
	// Hide the strip only once the dialog closes, so the thank-you stays readable.
	const close = () => {
		setOpen(false);
		if (sent) onRated(target.id);
	};
	return (
		<div className="flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-ink bg-paper px-5 py-4">
			<div className="min-w-0">
				<SpringChip spring={target.spring} text={target.dayLabel} />
				<p className="headline mt-1.5 text-lg text-ink">
					How was {shortTitle(target)}
					{target.teacherFirstName ? ` with ${target.teacherFirstName}` : ''}?
				</p>
			</div>
			<Button size="sm" onClick={() => setOpen(true)}>
				Rate this class
			</Button>
			<FeedbackDialog open={open} onClose={close} view={target} onSent={() => setSent(true)} />
		</div>
	);
}
