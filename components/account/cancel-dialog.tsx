'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/auth/auth-feedback';
import { shortTitle, type BookingView } from '@/components/account/booking-view';
import type { ChangeAction } from '@/components/account/change-window';
import { useBookingChange } from '@/components/account/use-booking-change';

/**
 * Confirm a cancellation. The copy repeats the exact cutoff the button obeys;
 * when the window has closed the dialog explains why instead of offering the
 * button.
 */
export function CancelDialog({
	open,
	onClose,
	view,
	action,
	onDone,
}: {
	open: boolean;
	onClose: () => void;
	view: BookingView;
	action: ChangeAction | null;
	onDone: () => void;
}) {
	const { run, pending, error, clearError } = useBookingChange(view.id);
	const allowed = action?.allowed ?? false;
	// null = still checking the clock (first render): neutral copy, no verdict.
	const checking = action === null;
	const close = () => {
		clearError();
		onClose();
	};
	const confirm = async () => {
		if (await run('cancel')) {
			onDone();
			close();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={close}
			size="sm"
			title={checking ? `Cancel ${shortTitle(view)}` : allowed ? `Cancel ${shortTitle(view)}?` : 'Too late to cancel online'}
			description={
				<span className="tabular">
					{view.dayLabel} · {view.time} · {view.studio?.short ?? view.locationTitle ?? 'Online'}
				</span>
			}
			footer={
				allowed ? (
					<>
						<Button variant="ghost" onClick={close}>
							Keep my bed
						</Button>
						<Button onClick={() => void confirm()} disabled={pending}>
							{pending ? 'Cancelling…' : 'Cancel booking'}
						</Button>
					</>
				) : (
					<Button variant="outline" onClick={close}>
						Close
					</Button>
				)
			}
		>
			{error ? <Notice className="mb-4">{error}</Notice> : null}
			{allowed ? (
				<p className="text-[0.95rem] leading-relaxed text-graphite">
					{action?.untilLabel ? (
						<>
							Cancelling is free until <span className="tabular text-ink">{action.untilLabel}</span>, {action.gapLabel} before class.{' '}
						</>
					) : null}
					Your bed goes back on the timetable for someone else, and we’ll email you to confirm.
				</p>
			) : (
				<p className="text-[0.95rem] leading-relaxed text-graphite">{action?.reason ?? 'Checking the cancellation window…'}</p>
			)}
		</Dialog>
	);
}
