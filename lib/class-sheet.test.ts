import { describe, expect, it } from 'vitest';
import { cancelCutoff, dayStats, formatDayTime, formatLocalDate, pricePreview, sameTimeNextWeek } from '@/lib/class-sheet';
import { codeState } from '@/lib/discount-state';
import { levelLabel } from '@/lib/timetable-lookup';
import type { Occurrence } from '@/lib/timetable';

function occ(p: Partial<Occurrence>): Occurrence {
	return {
		key: 'k',
		seriesId: 's1',
		seriesSlug: 'flow-mitte-lena',
		classKey: 'flow',
		productId: 'p',
		kind: 'class',
		title: 'Reformer Flow',
		variantTitle: 'Mitte · Lena',
		studioId: 'loc-mitte',
		studioKey: 'mitte',
		instructorId: 'staff-lena',
		roomKey: 'long-room',
		start: '2026-10-27T17:30:00.000Z',
		end: '2026-10-27T18:20:00.000Z',
		localDate: '2026-10-27',
		localTime: '18:30',
		weekday: 2,
		capacity: 12,
		attendees: 9,
		seatsLeft: 3,
		status: 'open',
		inferred: false,
		offPeak: false,
		price: 34,
		spring: 'yellow',
		level: 'Level 1',
		levelOrder: 1,
		...p,
	};
}

describe('cancelCutoff', () => {
	it('is start minus the gap, quoted in Berlin time', () => {
		const c = cancelCutoff('2026-10-27T17:30:00.000Z', 43_200, Date.parse('2026-10-26T12:00:00Z'));
		expect(new Date(c.at).toISOString()).toBe('2026-10-27T05:30:00.000Z');
		expect(c.passed).toBe(false);
		expect(formatDayTime(c.at)).toBe('Tue 27 Oct, 06:30');
	});

	it('crosses the 25 Oct fall-back correctly (12 real hours)', () => {
		// Sun 25 Oct 09:00 CET = 08:00Z → cutoff 20:00Z Sat = 22:00 CEST Sat
		const c = cancelCutoff('2026-10-25T08:00:00.000Z', 43_200);
		expect(formatDayTime(c.at)).toBe('Sat 24 Oct, 22:00');
	});

	it('falls back to the configured 12 hours and reports a passed cutoff', () => {
		const c = cancelCutoff('2026-10-27T17:30:00.000Z', 0, Date.parse('2026-10-27T10:00:00Z'));
		expect(c.gapSeconds).toBe(43_200);
		expect(c.passed).toBe(true);
	});
});

describe('sameTimeNextWeek', () => {
	it('finds the same series at the same local time across DST', () => {
		const a = occ({ localDate: '2026-10-20', localTime: '07:00', start: '2026-10-20T05:00:00.000Z' });
		const b = occ({ key: 'b', localDate: '2026-10-27', localTime: '07:00', start: '2026-10-27T06:00:00.000Z' });
		const other = occ({ key: 'c', seriesId: 's2', localDate: '2026-10-27', localTime: '07:00' });
		expect(sameTimeNextWeek(a, [other, b])).toEqual({ date: '2026-10-27', occurrence: b });
		expect(sameTimeNextWeek(b, [a, b])).toEqual({ date: '2026-11-03', occurrence: null });
	});
});

describe('dayStats', () => {
	it('sums beds and counts open classes', () => {
		const s = dayStats([occ({ capacity: 12, seatsLeft: 3 }), occ({ capacity: 6, seatsLeft: 0, status: 'full' })]);
		expect(s).toEqual({ classes: 2, open: 1, taken: 15, capacity: 18, fill: 15 / 18 });
		expect(dayStats([]).fill).toBe(0);
	});
});

describe('pricePreview', () => {
	it('previews off-peak and intro prices for group classes only', () => {
		expect(pricePreview({ price: 34, offPeak: true, kind: 'class' })).toEqual({ base: 34, offPeak: 27.2, intro: 23.8 });
		expect(pricePreview({ price: 34, offPeak: false, kind: 'online' })).toEqual({ base: 34, offPeak: null, intro: 23.8 });
		expect(pricePreview({ price: 55, offPeak: true, kind: 'workshop' })).toEqual({ base: 55, offPeak: null, intro: null });
	});
});

describe('codeState', () => {
	const intro = { id: 'd1', title: 'Intro offer', totalAmount: 10.2, scope: 'line_item' as const, code: null };
	it('separates an active code from one outranked by an automatic discount', () => {
		expect(codeState(null)).toEqual({ status: 'none' });
		expect(codeState({ appliedDiscountCode: 'TENSILE10', appliedDiscounts: [intro] })).toEqual({ status: 'outranked', code: 'TENSILE10' });
		expect(
			codeState({ appliedDiscountCode: 'tensile10', appliedDiscounts: [{ ...intro, id: 'd2', code: 'TENSILE10' }] }),
		).toEqual({ status: 'active', code: 'tensile10' });
	});
});

describe('formatting and labels', () => {
	it('formats local dates and level labels', () => {
		expect(formatLocalDate('2026-10-27')).toBe('Tue 27 Oct');
		expect(levelLabel(['All levels', 'Foundations'])).toBe('Foundations & all levels');
		expect(levelLabel(['Level 2'])).toBe('Level 2');
		expect(levelLabel(['All levels'])).toBe('All levels');
	});
});
