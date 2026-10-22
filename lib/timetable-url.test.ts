import { describe, expect, it } from 'vitest';
import { activeFilterCount, parseOccParam, parseTimetableParams, timetableHref } from '@/lib/timetable-url';

describe('parseTimetableParams', () => {
	it('reads every param from URLSearchParams', () => {
		const p = parseTimetableParams(
			new URLSearchParams('studio=mitte&class=flow&level=1&instructor=lena-hoffmann&time=evening&day=2026-10-27&occ=flow-mitte-lena%402026-10-27T17%3A30%3A00.000Z'),
		);
		expect(p).toEqual({
			studio: 'mitte',
			class: 'flow',
			level: 1,
			instructor: 'lena-hoffmann',
			time: 'evening',
			day: '2026-10-27',
			occ: { seriesSlug: 'flow-mitte-lena', start: '2026-10-27T17:30:00.000Z' },
		});
	});

	it('reads a Next searchParams record (arrays take the first value)', () => {
		expect(parseTimetableParams({ studio: ['kreuzberg', 'mitte'], time: 'midday' })).toMatchObject({ studio: 'kreuzberg', time: 'midday' });
	});

	it('drops malformed values', () => {
		const p = parseTimetableParams(new URLSearchParams('studio=<script>&level=12&time=night&day=27-10-2026&occ=nope'));
		expect(p).toEqual({ studio: null, class: null, level: null, instructor: null, time: null, day: null, occ: null });
	});

	it('normalises case and the occ start', () => {
		expect(parseTimetableParams(new URLSearchParams('class=FLOW')).class).toBe('flow');
		expect(parseOccParam('tower-mitte-elif@2026-10-27T17:30:00Z')).toEqual({ seriesSlug: 'tower-mitte-elif', start: '2026-10-27T17:30:00.000Z' });
		expect(parseOccParam('@2026-10-27T17:30:00Z')).toBeNull();
		expect(parseOccParam('flow@2026-10-27')).toBeNull();
	});
});

describe('timetableHref', () => {
	it('builds a bare link and filter links', () => {
		expect(timetableHref()).toBe('/timetable');
		expect(timetableHref({ class: 'foundations', studio: null, level: 0 })).toBe('/timetable?class=foundations&level=0');
	});

	it('deep-links a class sheet and sets its day', () => {
		const href = timetableHref({ occ: { seriesSlug: 'flow-mitte-lena', start: '2026-10-27T17:30:00.000Z', localDate: '2026-10-27' } });
		expect(href).toBe('/timetable?day=2026-10-27&occ=flow-mitte-lena%402026-10-27T17%3A30%3A00.000Z');
		const back = parseTimetableParams(new URL(href, 'https://x.test').searchParams);
		expect(back.occ).toEqual({ seriesSlug: 'flow-mitte-lena', start: '2026-10-27T17:30:00.000Z' });
		expect(back.day).toBe('2026-10-27');
	});

	it('counts active filters (day and occ are not filters)', () => {
		expect(activeFilterCount({ studio: 'mitte', class: null, level: 0, instructor: null, time: null })).toBe(2);
	});
});
