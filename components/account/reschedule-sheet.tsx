'use client';

import { useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/auth/auth-feedback';
import { localParts } from '@/lib/timetable';
import { dayLabel, shortTitle, type BookingView } from '@/components/account/booking-view';
import type { ChangeAction } from '@/components/account/change-window';
import type { SlotStart } from '@/components/account/slots';
import { ReschedulePicker } from '@/components/account/reschedule-picker';
import { useBookingChange } from '@/components/account/use-booking-change';

/**
 * Move a booking to another time of the same series: same class, studio and
 * teacher. Closed windows explain themselves instead of showing the picker.
 */
export function RescheduleSheet({
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
	const [date, setDate] = useState<string | null>(null);
	const [slot, setSlot] = useState<SlotStart | null>(null);
	const { run, pending, error, clearError } = useBookingChange(view.id);
	const allowed = action?.allowed ?? false;

	const close = () => {
		clearError();
		setSlot(null);
		setDate(null);
		onClose();
	};
	const confirm = async () => {
		if (slot && (await run('reschedule', slot.slot))) {
			onDone();
			close();
		}
	};
	const pickDate = (d: string) => {
		setDate(d);
		setSlot(null);
	};

	return (
		<Sheet
			open={open}
			onClose={close}
			eyebrow={`${shortTitle(view)} · ${view.studio?.short ?? view.locationTitle ?? 'Online'}${view.teacherFirstName ? ` · ${view.teacherFirstName}` : ''}`}
			title="Move to another time"
			footer={
				allowed ? (
					<div className="flex items-center justify-between gap-4 py-1">
						<p className="tabular min-w-0 text-sm text-graphite">
							{slot ? (
								<>
									<span className="text-ink">{dayLabel(slot.start)}</span> · {localParts(slot.start).time}
								</>
							) : (
								'Pick a day and time'
							)}
						</p>
						<Button onClick={() => void confirm()} disabled={!slot || pending}>
							{pending ? 'Moving…' : 'Move my bed'}
						</Button>
					</div>
				) : null
			}
		>
			<div className="mb-6 rounded-[2px] border border-line bg-plaster/60 px-4 py-3 text-sm text-graphite">
				Now: <span className="tabular text-ink">{view.dayLabel} · {view.time}</span>
				{action?.untilLabel && allowed ? (
					<>
						. Free to move until <span className="tabular text-ink">{action.untilLabel}</span>.
					</>
				) : null}
			</div>
			{error ? <Notice className="mb-5">{error}</Notice> : null}
			{allowed ? (
				<ReschedulePicker view={view} date={date} onDate={pickDate} selected={slot} onSelect={setSlot} />
			) : (
				<p className="text-[0.95rem] leading-relaxed text-graphite">{action ? action.reason : 'Checking the change window…'}</p>
			)}
		</Sheet>
	);
}
