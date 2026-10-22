import { describe, expect, it } from 'vitest';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { levelPath } from '@/lib/level-path';
import { toBookingView, type BookingAppt } from './booking-view';
import { changeWindow, policyLine } from './change-window';
import { levelSentence, splitBookings, studiosVisited } from './account-insights';
import { slotStarts } from './slots';

const HOUR = 3_600_000;

function appt(over: Partial<BookingAppt> = {}): BookingAppt {
	return {
		id: 'a1',
		status: 'scheduled',
		// Tue 27 Oct 2026 18:45 Berlin (CET, UTC+1)
		from: '2026-10-27T17:45:00.000Z',
		to: '2026-10-27T18:35:00.000Z',
		numberOfAttendees: 1,
		product: { id: 'p-flow-mitte', slug: 'flow-mitte-lena', title: 'Reformer Flow', color: 'yellow', maxAttendees: 12, cancelGap: 43_200, rescheduleGap: 43_200 },
		staffMember: { firstName: 'Lena', lastName: 'Hoffmann', slug: 'lena-hoffmann' },
		location: { id: 'loc-mitte', slug: 'tensile-mitte', title: 'Tensile Mitte', type: 'physical' },
		...over,
	};
}

describe('toBookingView', () => {
	it('reads Berlin time, spring, studio and room from config', () => {
		const v = toBookingView(appt());
		expect(v.time).toBe('18:45');
		expect(v.dayLabel).toBe('Tue 27 Oct');
		expect(v.spring).toBe('yellow');
		expect(v.studio?.short).toBe('Mitte');
		expect(v.room?.name).toBe('Long Room');
		expect(v.minutes).toBe(50);
		expect(v.productId).toBe('p-flow-mitte');
	});

	it('uses the private room for privates and no room online', () => {
		expect(toBookingView(appt({ product: { slug: 'private-mitte-duet', maxAttendees: 1 } })).room?.private).toBe(true);
		const online = toBookingView(appt({ product: { slug: 'online-mat-online-mika' }, location: { slug: 'tensile-at-home', type: 'online', link: 'https://x' } }));
		expect(online.room).toBeNull();
		expect(online.joinUrl).toBe('https://x');
		expect(online.spring).toBe('green');
	});
});

describe('changeWindow', () => {
	const start = Date.parse('2026-10-27T17:45:00.000Z');

	it('is open until exactly start − 12 h, and the copy prints that instant', () => {
		const w = changeWindow(appt(), start - 12 * HOUR - 1);
		expect(w.cancel.allowed).toBe(true);
		expect(w.cancel.untilLabel).toBe('Tue 27 Oct, 06:45');
		expect(policyLine(w)).toBe('Free to cancel or move until Tue 27 Oct, 06:45 (12 hours before class).');
	});

	it('closes at the cutoff with a reason', () => {
		const w = changeWindow(appt(), start - 12 * HOUR);
		expect(w.cancel.allowed).toBe(false);
		expect(w.reschedule.allowed).toBe(false);
		expect(w.cancel.reason).toMatch(/closed 12 hours before class, at Tue 27 Oct, 06:45/);
	});

	it('respects product flags and status', () => {
		const p = { ...appt().product!, allowCustomerCancel: false };
		expect(changeWindow(appt({ product: p }), 0).cancel.allowed).toBe(false);
		expect(changeWindow(appt({ product: p }), 0).reschedule.allowed).toBe(true);
		expect(policyLine(changeWindow(appt({ product: p }), 0))).toMatch(/^Free to move until/);
		expect(changeWindow(appt({ status: 'canceled' }), 0).cancel.reason).toBe('This booking is cancelled.');
	});
});

describe('account insights', () => {
	const now = Date.parse('2026-10-20T12:00:00Z');
	const past = toBookingView(appt({ id: 'p', from: '2026-10-10T08:00:00Z', to: '2026-10-10T08:50:00Z' }));
	const next = toBookingView(appt({ id: 'n' }));
	const gone = toBookingView(appt({ id: 'c', status: 'canceled' }));

	it('splits upcoming, past and cancelled', () => {
		const s = splitBookings([next, past, gone], now);
		expect(s.upcoming.map((v) => v.id)).toEqual(['n']);
		expect(s.past.map((v) => v.id)).toEqual(['p']);
		expect(s.cancelled.map((v) => v.id)).toEqual(['c']);
	});

	it('counts studios visited', () => {
		const kb = toBookingView(appt({ id: 'k', location: { slug: 'tensile-kreuzberg', title: 'Tensile Kreuzberg', type: 'physical' } }));
		expect(studiosVisited([past, past, kb])).toEqual([
			{ slug: 'tensile-mitte', name: 'Mitte', online: false, count: 2 },
			{ slug: 'tensile-kreuzberg', name: 'Kreuzberg', online: false, count: 1 },
		]);
	});

	it('writes the level sentence', () => {
		expect(levelSentence(levelPath({}))).toMatch(/^Start with Foundations/);
		expect(levelSentence(levelPath({ foundations: 1, flow: 7 }))).toBe('3 more Flow classes to unlock Sculpt.');
		expect(levelSentence(levelPath({ foundations: 1, flow: 9 }))).toBe('1 more Flow class to unlock Sculpt.');
	});
});

describe('slotStarts', () => {
	const slot = (fromTime: string, toTime: string, attendees = 0): CurrentAvailabilitySlot => ({
		productId: 'p',
		fromDate: '2026-11-03',
		fromTime,
		toDate: '2026-11-03',
		toTime,
		attendees,
		maxAttendees: 12,
	});

	it('splits merged ranges, drops full, past and excluded starts', () => {
		const now = Date.parse('2026-11-03T06:00:00Z');
		const out = slotStarts([slot('07:00:00', '08:40:00'), slot('17:45:00', '18:35:00', 12), slot('05:00:00', '05:50:00')], {
			durationSec: 3000,
			now,
			exclude: Date.parse('2026-11-03T07:50:00Z'),
			staffMemberId: 's',
			locationId: 'l',
		});
		expect(out.map((o) => o.slot.fromTime)).toEqual(['07:00:00']);
		expect(out[0]!.slot).toMatchObject({ toTime: '07:50:00', staffMemberId: 's', locationId: 'l' });
		expect(out[0]!.seatsLeft).toBe(12);
	});
});
