import { describe, expect, it } from 'vitest';
import { localParts, type Occurrence } from '@/lib/timetable';
import { dayLabel, formatDay, occurrenceHref, selectBoard } from './board-logic';

function occ(o: Partial<Occurrence> & { start: string; classKey?: string }): Occurrence {
	const parts = localParts(o.start);
	const seatsLeft = o.seatsLeft ?? 4;
	return {
		key: `${o.seriesId ?? 'flow-mitte-lena'}@${o.start}`,
		seriesId: 'flow-mitte-lena',
		seriesSlug: 'flow-mitte-lena',
		classKey: 'flow',
		productId: 'p-flow',
		kind: 'class',
		title: 'Reformer Flow',
		variantTitle: 'Mitte · Lena',
		studioId: 'loc-mitte',
		studioKey: 'mitte',
		instructorId: 'staff-lena',
		roomKey: 'long-room',
		end: o.start,
		localDate: parts.date,
		localTime: parts.time,
		weekday: parts.weekday,
		capacity: 12,
		attendees: 12 - seatsLeft,
		status: seatsLeft <= 0 ? 'full' : seatsLeft <= 2 ? 'low' : 'open',
		inferred: false,
		offPeak: false,
		price: 34,
		spring: 'yellow',
		level: 'Level 1',
		levelOrder: 1,
		...o,
		seatsLeft,
	};
}

// Tue 27 Oct 2026, 10:00 Berlin (CET, UTC+1).
const NOW = Date.parse('2026-10-27T09:00:00.000Z');

describe('formatDay / dayLabel', () => {
	it('formats a Berlin date without shifting it', () => {
		expect(formatDay('2026-10-28')).toBe('Wed 28 Oct');
	});
	it('names today and tomorrow', () => {
		expect(dayLabel('2026-10-27', '2026-10-27')).toBe('Today');
		expect(dayLabel('2026-10-28', '2026-10-27')).toBe('Tomorrow');
		expect(dayLabel('2026-10-30', '2026-10-27')).toBe('Fri 30 Oct');
	});
});

describe('selectBoard', () => {
	it('drops started classes, privates and workshops, and keeps time order', () => {
		const all = [
			occ({ start: '2026-10-27T17:30:00.000Z', seriesId: 'b' }),
			occ({ start: '2026-10-27T06:00:00.000Z', seriesId: 'past' }),
			occ({ start: '2026-10-27T11:15:00.000Z', seriesId: 'a' }),
			occ({ start: '2026-10-27T12:00:00.000Z', seriesId: 'w', kind: 'workshop' }),
		];
		const board = selectBoard(all, NOW);
		expect(board.scope).toBe('today');
		expect(board.rows.map((r) => r.occurrence.seriesId)).toEqual(['a', 'b']);
		expect(board.classesLeftToday).toBe(2);
		expect(board.bedsFreeToday).toBe(8);
	});

	it('caps the rows and rolls into tomorrow with a day label', () => {
		const all = [
			occ({ start: '2026-10-27T18:00:00.000Z', seriesId: 'today' }),
			...Array.from({ length: 8 }, (_, i) => occ({ start: `2026-10-28T0${i + 1}:00:00.000Z`, seriesId: `t${i}` })),
		];
		const board = selectBoard(all, NOW, 6);
		expect(board.rows).toHaveLength(6);
		expect(board.rows[0]?.dayLabel).toBe('Today');
		expect(board.rows[1]?.dayLabel).toBe('Tomorrow');
		expect(board.classesThisWeek).toBe(9);
	});

	it('says tomorrow when nothing is left today', () => {
		const board = selectBoard([occ({ start: '2026-10-28T06:00:00.000Z' })], NOW);
		expect(board.scope).toBe('tomorrow');
		expect(board.classesLeftToday).toBe(0);
	});

	it('finds the next class with space for a Full row', () => {
		const full = occ({ start: '2026-10-27T17:30:00.000Z', seriesId: 'full', seatsLeft: 0 });
		const later = occ({ start: '2026-10-28T17:30:00.000Z', seriesId: 'later', studioKey: 'kreuzberg' });
		const board = selectBoard([full, later], NOW);
		expect(board.rows[0]?.next?.seriesId).toBe('later');
		expect(board.rows[1]?.next).toBeNull();
	});

	it('is empty without data', () => {
		expect(selectBoard([], NOW)).toMatchObject({ rows: [], classesLeftToday: 0, bedsFreeToday: 0, classesThisWeek: 0 });
	});
});

describe('occurrenceHref', () => {
	it('builds the class-sheet deep link', () => {
		const href = occurrenceHref({ seriesSlug: 'flow-mitte-lena', start: '2026-10-27T17:30:00.000Z', localDate: '2026-10-27' });
		const url = new URL(href, 'https://x.test');
		expect(url.pathname).toBe('/timetable');
		expect(url.searchParams.get('occ')).toBe('flow-mitte-lena@2026-10-27T17:30:00.000Z');
		expect(url.searchParams.get('day')).toBe('2026-10-27');
	});
});
