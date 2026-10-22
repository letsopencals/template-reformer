import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';

/**
 * Availability ranges → bookable class starts, for rescheduling and "same time
 * next week?". A range is normally one class; one that is an exact multiple
 * of the class length is split (same rule as `lib/timetable.ts`). Full starts
 * and starts at or before `now` are dropped.
 */

export interface SlotStart {
	/** Epoch ms. */
	start: number;
	end: number;
	seatsLeft: number;
	capacity: number;
	/** Body for `PUT /api/account/appointments/:id/reschedule` (UTC). */
	slot: { productId: string; fromDate: string; fromTime: string; toDate: string; toTime: string; staffMemberId: string | null; locationId: string | null };
}

function parse(date: string, time: string): number {
	return Date.parse(`${date}T${time.length === 5 ? `${time}:00` : time}Z`);
}

function split(ms: number): { date: string; time: string } {
	const iso = new Date(ms).toISOString();
	return { date: iso.slice(0, 10), time: iso.slice(11, 19) };
}

export function slotStarts(
	slots: CurrentAvailabilitySlot[],
	opts: { durationSec: number; now: number; staffMemberId?: string | null; locationId?: string | null; exclude?: number },
): SlotStart[] {
	const step = opts.durationSec * 1000;
	const byStart = new Map<number, SlotStart>();
	for (const s of slots) {
		const from = parse(s.fromDate, s.fromTime);
		const to = parse(s.toDate, s.toTime);
		if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
		const len = to - from;
		const count = step > 0 && len > step && len % step === 0 ? len / step : 1;
		const capacity = s.maxAttendees || 1;
		const seatsLeft = Math.max(0, capacity - (s.attendees ?? 0));
		if (seatsLeft <= 0) continue;
		for (let i = 0; i < count; i++) {
			const start = from + i * step;
			const end = step > 0 ? start + step : to;
			if (start <= opts.now || start === opts.exclude) continue;
			const a = split(start);
			const b = split(end);
			const prev = byStart.get(start);
			if (prev && prev.seatsLeft >= seatsLeft) continue;
			byStart.set(start, {
				start,
				end,
				seatsLeft,
				capacity,
				slot: {
					productId: s.productId,
					fromDate: a.date,
					fromTime: a.time,
					toDate: b.date,
					toTime: b.time,
					staffMemberId: opts.staffMemberId ?? s.staffMemberIds?.[0] ?? null,
					locationId: opts.locationId ?? s.locationIds?.[0] ?? null,
				},
			});
		}
	}
	return [...byStart.values()].sort((x, y) => x.start - y.start);
}
