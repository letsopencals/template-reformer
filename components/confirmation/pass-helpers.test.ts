import { describe, expect, it } from 'vitest';
import { bedIndexFor, countdownLabel, directionsHref, sameTimeNextWeek } from './pass-helpers';

describe('bedIndexFor', () => {
	it('is stable and inside the room', () => {
		const a = bedIndexFor('0f8e1c2a-appointment', 12);
		expect(bedIndexFor('0f8e1c2a-appointment', 12)).toBe(a);
		for (const id of ['a', 'b', 'c', 'long-uuid-1234', '']) {
			const i = bedIndexFor(id, 8);
			expect(i).toBeGreaterThanOrEqual(0);
			expect(i).toBeLessThan(8);
		}
		expect(bedIndexFor('x', 0)).toBe(0);
	});
});

describe('sameTimeNextWeek', () => {
	it('keeps Berlin wall-clock time across the DST change', () => {
		// Thu 22 Oct 2026 18:45 CEST (16:45Z) → Thu 29 Oct 18:45 CET (17:45Z)
		const next = sameTimeNextWeek(Date.parse('2026-10-22T16:45:00Z'));
		expect(next).toEqual({ date: '2026-10-29', time: '18:45', start: Date.parse('2026-10-29T17:45:00Z') });
	});
});

describe('countdownLabel', () => {
	const start = 10 * 86_400_000;
	const end = start + 50 * 60_000;
	it('reads days, hours, minutes, live and over', () => {
		expect(countdownLabel(start, end, start - (2 * 24 + 4) * 3_600_000)).toBe('Starts in 2 d 4 h');
		expect(countdownLabel(start, end, start - 90 * 60_000)).toBe('Starts in 1 h 30 min');
		expect(countdownLabel(start, end, start - 35 * 60_000)).toBe('Starts in 35 min');
		expect(countdownLabel(start, end, start + 1)).toBe('On now');
		expect(countdownLabel(start, end, end)).toBe('Finished');
	});
});

describe('directionsHref', () => {
	it('encodes the address', () => {
		expect(directionsHref('Torstraße 140, 10119 Berlin')).toBe('https://www.google.com/maps/search/?api=1&query=Torstra%C3%9Fe%20140%2C%2010119%20Berlin');
	});
});
