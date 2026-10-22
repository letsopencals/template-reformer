import { formatGap } from '@/lib/policy';
import { siteConfig } from '@/lib/site-config';
import { localParts } from '@/lib/timetable';
import { dayLabel, type BookingAppt } from '@/components/account/booking-view';

/**
 * When a booking can still be cancelled or moved online. Mirrors the backend
 * (and `lib/policy.ts`): scheduled, allowed on the product, and `now` before
 * the exact instant `start − gap`. The copy prints that same instant, so the
 * "Free to cancel until …" line and the button always agree. The backend
 * re-checks every request.
 */

export interface ChangeAction {
	allowed: boolean;
	/** Epoch ms of the cutoff, or null with no gap. */
	until: number | null;
	/** "Tue 27 Oct, 06:45", or null. */
	untilLabel: string | null;
	/** "12 hours" */
	gapLabel: string | null;
	/** Why it isn't allowed (null when it is). */
	reason: string | null;
}

export interface ChangeWindow {
	cancel: ChangeAction;
	reschedule: ChangeAction;
}

function cutoffLabel(ms: number): string {
	return `${dayLabel(ms)}, ${localParts(ms).time}`;
}

function action(appt: BookingAppt, now: number, gapSeconds: number, allowedOnProduct: boolean, verb: 'cancel' | 'move'): ChangeAction {
	const start = Date.parse(appt.from);
	const gap = Math.max(0, gapSeconds);
	const until = gap > 0 ? start - gap * 1000 : start;
	const base = { until: gap > 0 ? until : null, untilLabel: gap > 0 ? cutoffLabel(until) : null, gapLabel: gap > 0 ? formatGap(gap) : null };

	let reason: string | null = null;
	if (appt.status === 'canceled') reason = 'This booking is cancelled.';
	else if (appt.status !== 'scheduled') reason = start <= now ? 'This class is over.' : 'This booking isn’t confirmed yet.';
	else if (start <= now) reason = 'This class has started.';
	else if (!allowedOnProduct) reason = `This class can’t be ${verb === 'cancel' ? 'cancelled' : 'moved'} online. Email ${siteConfig.contact.email} and we’ll help.`;
	else if (until <= now)
		reason = `Online ${verb === 'cancel' ? 'cancellation' : 'changes'} closed ${base.gapLabel ?? ''} before class, at ${base.untilLabel ?? ''}. Email ${siteConfig.contact.email} and we’ll see what we can do.`;

	return { allowed: reason === null, reason, ...base };
}

export function changeWindow(appt: BookingAppt, now: number = Date.now()): ChangeWindow {
	const p = appt.product;
	return {
		cancel: action(appt, now, p?.cancelGap ?? 0, p?.allowCustomerCancel !== false, 'cancel'),
		reschedule: action(appt, now, p?.rescheduleGap ?? 0, p?.allowCustomerReschedule !== false, 'move'),
	};
}

/** The one-line policy under a booking: "Free to cancel until Tue 27 Oct, 06:45 (12 hours before)". */
export function policyLine(w: ChangeWindow): string | null {
	const { cancel: c, reschedule: r } = w;
	const until = (a: ChangeAction) => (a.untilLabel ? `until ${a.untilLabel} (${a.gapLabel} before class)` : 'until class starts');
	if (c.allowed && r.allowed && c.until === r.until) return `Free to cancel or move ${until(c)}.`;
	if (c.allowed) return `Free to cancel ${until(c)}.`;
	if (r.allowed) return `Free to move ${until(r)}.`;
	return c.reason;
}
