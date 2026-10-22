'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import type { BookingView } from '@/components/account/booking-view';
import { BookingActions } from '@/components/account/booking-actions';
import { FeedbackDialog } from '@/components/account/feedback-dialog';
import { JoinButton } from '@/components/account/join-button';
import type { DetailAction } from '@/components/account/appointment-detail/appointment-detail-view';

/**
 * The pass's action row, by state: upcoming → Join (online) + Move / Cancel;
 * over → Rate + Book again; cancelled → Book again. Extras booked with the
 * class are listed (never checkout answers or merchant notes).
 */
export function DetailActions({
	view,
	detail,
	now,
	initial,
	onChanged,
}: {
	view: BookingView;
	detail: AppointmentDetailResponse;
	now: number | null;
	initial: DetailAction | null;
	onChanged: () => void;
}) {
	const [rating, setRating] = useState(initial === 'feedback');
	if (now === null) return <div className="min-h-9" />;

	const extras = (detail.addOns ?? []).map((a) => `${a.addOn?.title ?? 'Extra'}${a.quantity > 1 ? ` × ${a.quantity}` : ''}`);
	const cancelled = view.status === 'canceled';
	const over = !cancelled && view.end <= now;
	const answered = (detail.feedbackQuestionAnswers?.length ?? 0) > 0;

	return (
		<div className="flex flex-wrap items-start justify-between gap-6">
			<div className="space-y-1 text-sm">
				{extras.length ? (
					<p className="text-graphite">
						<span className="eyebrow mr-2 text-steel">Extras</span>
						{extras.join(', ')}
					</p>
				) : null}
				{cancelled ? <p className="text-graphite">This booking is cancelled. The bed went back on the timetable.</p> : null}
				{over ? <p className="text-graphite">{answered ? 'Thanks for your feedback.' : 'Class done. A quick rating helps your teacher.'}</p> : null}
			</div>

			<div className="flex flex-wrap items-center gap-3">
				{!cancelled && !over ? (
					<>
						{view.isOnline && view.joinUrl ? <JoinButton joinUrl={view.joinUrl} from={view.startIso} to={view.endIso} size="md" /> : null}
						<BookingActions
							view={view}
							onChanged={onChanged}
							initial={initial === 'cancel' || initial === 'reschedule' ? initial : null}
							className="sm:max-w-[22rem]"
						/>
					</>
				) : null}
				{over && !answered ? <Button onClick={() => setRating(true)}>Rate this class</Button> : null}
				{(over || cancelled) && view.bookAgainHref ? (
					<Link href={view.bookAgainHref} className="link-underline text-sm text-ink">
						Book again <span aria-hidden>→</span>
					</Link>
				) : null}
			</div>
			{over ? <FeedbackDialog open={rating} onClose={() => setRating(false)} view={view} onSent={onChanged} /> : null}
		</div>
	);
}
