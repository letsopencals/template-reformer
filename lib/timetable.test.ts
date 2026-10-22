import { describe, expect, it } from 'vitest';
import {
	buildTimetable,
	filterOccurrences,
	groupByDay,
	inferFull,
	isOffPeak,
	localDates,
	localParts,
	localToUtc,
	nextWithSpace,
	seatStatus,
	slotsToOccurrences,
	timeOfDay,
	weekStart,
} from '@/lib/timetable';
import { series, slot } from '@/lib/test-fixtures';

const H = 3_600_000;
const DAY = 24 * H;

describe('Berlin time helpers', () => {
	it('reads local parts in summer (CEST, UTC+2) and winter (CET, UTC+1)', () => {
		expect(localParts('2026-10-19T05:00:00Z')).toEqual({ date: '2026-10-19', time: '07:00', weekday: 1 });
		expect(localParts('2026-10-26T06:00:00Z')).toEqual({ date: '2026-10-26', time: '07:00', weekday: 1 });
		// 23:30Z on a Saturday is already Sunday in Berlin
		expect(localParts('2026-10-24T22:30:00Z')).toEqual({ date: '2026-10-25', time: '00:30', weekday: 7 });
	});

	it('converts local time to UTC across the 25 Oct 2026 fall-back', () => {
		expect(new Date(localToUtc('2026-10-24', '09:00')).toISOString()).toBe('2026-10-24T07:00:00.000Z');
		expect(new Date(localToUtc('2026-10-25', '09:00')).toISOString()).toBe('2026-10-25T08:00:00.000Z');
		// spring forward, 29 Mar 2026
		expect(new Date(localToUtc('2026-03-28', '18:00')).toISOString()).toBe('2026-03-28T17:00:00.000Z');
		expect(new Date(localToUtc('2026-03-29', '18:00')).toISOString()).toBe('2026-03-29T16:00:00.000Z');
	});

	it('lists dates and weeks', () => {
		expect(localDates('2026-10-30', 4)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
		expect(weekStart('2026-10-25')).toBe('2026-10-19');
		expect(weekStart('2026-10-26')).toBe('2026-10-26');
	});

	it('flags off-peak starts Mon–Fri 10:00–16:00 inclusive', () => {
		expect(isOffPeak({ weekday: 1, time: '12:15' })).toBe(true);
		expect(isOffPeak({ weekday: 5, time: '10:00' })).toBe(true);
		expect(isOffPeak({ weekday: 5, time: '16:00' })).toBe(true);
		expect(isOffPeak({ weekday: 5, time: '16:01' })).toBe(false);
		expect(isOffPeak({ weekday: 3, time: '09:59' })).toBe(false);
		expect(isOffPeak({ weekday: 6, time: '12:00' })).toBe(false);
	});

	it('buckets time of day', () => {
		expect(timeOfDay('07:00')).toBe('morning');
		expect(timeOfDay('12:15')).toBe('midday');
		expect(timeOfDay('16:00')).toBe('evening');
	});
});

describe('slotsToOccurrences', () => {
	const flow = series({ id: 'flow-mitte-lena', classKey: 'flow' });
	const now = Date.parse('2026-10-18T12:00:00Z');
	const until = now + 30 * DAY;

	it('computes seats left and status from attendees', () => {
		const occ = slotsToOccurrences(flow, [slot('2026-10-19T05:00:00Z', 50, 4), slot('2026-10-20T16:00:00Z', 50, 10)], { now, until });
		expect(occ.map((o) => [o.localTime, o.seatsLeft, o.status])).toEqual([
			['07:00', 8, 'open'],
			['18:00', 2, 'low'],
		]);
		expect(occ[0]!.end).toBe('2026-10-19T05:50:00.000Z');
		expect(occ[0]!.inferred).toBe(false);
	});

	it('drops past and out-of-horizon slots', () => {
		const occ = slotsToOccurrences(flow, [slot('2026-10-18T05:00:00Z', 50), slot('2026-12-01T05:00:00Z', 50), slot('2026-10-21T05:00:00Z', 50)], { now, until });
		expect(occ).toHaveLength(1);
	});

	it('splits a range that merged two back-to-back classes', () => {
		const occ = slotsToOccurrences(flow, [slot('2026-10-19T05:00:00Z', 100, 3)], { now, until });
		expect(occ.map((o) => o.localTime)).toEqual(['07:00', '07:50']);
	});

	it('keeps one occurrence for a range of an odd length', () => {
		expect(slotsToOccurrences(flow, [slot('2026-10-19T05:00:00Z', 75)], { now, until })).toHaveLength(1);
	});

	it('flags off-peak midday classes', () => {
		const [o] = slotsToOccurrences(flow, [slot('2026-10-20T10:15:00Z', 50)], { now, until });
		expect(o!.localTime).toBe('12:15');
		expect(o!.offPeak).toBe(true);
	});

	it('maps seat status', () => {
		expect(seatStatus(0)).toBe('full');
		expect(seatStatus(2)).toBe('low');
		expect(seatStatus(3)).toBe('open');
	});
});

describe('Full inference', () => {
	const now = Date.parse('2026-10-18T12:00:00Z'); // Sunday
	const flow = series({ id: 'flow-mitte-lena', classKey: 'flow' });

	it('infers a missing weekly slot as Full', () => {
		const slots = {
			[flow.id]: [slot('2026-10-20T16:45:00Z', 50), slot('2026-11-03T17:45:00Z', 50)], // Tue 18:45 CEST, Tue 18:45 CET
		};
		const tt = buildTimetable([flow], slots, { now, horizonDays: 21 });
		expect(tt.map((o) => [o.localDate, o.localTime, o.status, o.inferred])).toEqual([
			['2026-10-20', '18:45', 'open', false],
			['2026-10-27', '18:45', 'full', true],
			['2026-11-03', '18:45', 'open', false],
		]);
		const full = tt[1]!;
		expect(full.start).toBe('2026-10-27T17:45:00.000Z');
		expect(full.seatsLeft).toBe(0);
		expect(full.attendees).toBe(full.capacity);
	});

	it('keeps one pattern across the DST change (no phantom twins)', () => {
		// Mon 07:00 Berlin: 05:00Z before 25 Oct, 06:00Z after
		const slots = {
			[flow.id]: [slot('2026-10-19T05:00:00Z', 50), slot('2026-11-02T06:00:00Z', 50), slot('2026-11-09T06:00:00Z', 50)],
		};
		const tt = buildTimetable([flow], slots, { now, horizonDays: 25 });
		expect(tt).toHaveLength(4);
		expect(tt.every((o) => o.localTime === '07:00' && o.weekday === 1)).toBe(true);
		expect(tt.filter((o) => o.inferred).map((o) => o.start)).toEqual(['2026-10-26T06:00:00.000Z']);
	});

	it('handles several weekly patterns per series', () => {
		const slots = {
			[flow.id]: [
				slot('2026-10-19T05:00:00Z', 50), // Mon 07:00
				slot('2026-10-22T16:00:00Z', 50), // Thu 18:00
				slot('2026-10-26T06:00:00Z', 50), // Mon 07:00
				// Thu 29 Oct 18:00 missing
				slot('2026-11-02T06:00:00Z', 50),
			],
		};
		const tt = buildTimetable([flow], slots, { now, horizonDays: 21 });
		expect(tt.filter((o) => o.inferred).map((o) => `${o.localDate} ${o.localTime}`)).toEqual(['2026-10-29 18:00']);
	});

	it('never infers past the last start the API returned (end of the booking window)', () => {
		const other = series({ id: 'sculpt-mitte-jonas', classKey: 'sculpt' });
		const slots = {
			[flow.id]: [slot('2026-10-19T05:00:00Z', 50), slot('2026-10-26T06:00:00Z', 50)],
			[other.id]: [slot('2026-10-28T17:00:00Z', 50)], // Wed 28 Oct is the last start anywhere
		};
		const tt = buildTimetable([flow, other], slots, { now, horizonDays: 21 });
		expect(tt.some((o) => o.inferred && o.seriesId === flow.id)).toBe(false);
	});

	it('infers inside the window when another series proves the API covers that date', () => {
		const other = series({ id: 'sculpt-mitte-jonas', classKey: 'sculpt' });
		const slots = {
			[flow.id]: [slot('2026-10-19T05:00:00Z', 50), slot('2026-10-26T06:00:00Z', 50)],
			[other.id]: [slot('2026-11-04T17:00:00Z', 50)],
		};
		const tt = buildTimetable([flow, other], slots, { now, horizonDays: 21 });
		expect(tt.filter((o) => o.inferred && o.seriesId === flow.id).map((o) => o.localDate)).toEqual(['2026-11-02']);
	});

	it('does not infer slots inside the advance-booking threshold', () => {
		const near = Date.parse('2026-10-19T04:30:00Z'); // 30 min before Mon 07:00 Berlin
		const s = series({ id: 'flow-x', classKey: 'flow', advanceThreshold: 3600 });
		const observed = slotsToOccurrences(s, [slot('2026-10-26T06:00:00Z', 50), slot('2026-11-02T06:00:00Z', 50)], { now: near, until: near + 21 * DAY });
		expect(inferFull(s, observed, { now: near, cutoff: Date.parse('2026-11-02T06:00:00Z') })).toEqual([]);
	});

	it('infers today’s missing class when it is still ahead', () => {
		const morning = Date.parse('2026-10-19T03:00:00Z'); // Mon 05:00 Berlin
		const observed = slotsToOccurrences(flow, [slot('2026-10-26T06:00:00Z', 50)], { now: morning, until: morning + 21 * DAY });
		const full = inferFull(flow, observed, { now: morning, cutoff: Date.parse('2026-10-26T06:00:00Z') });
		expect(full.map((o) => o.start)).toEqual(['2026-10-19T05:00:00.000Z']);
	});

	it('never infers workshops or privates', () => {
		const workshop = series({ id: 'workshop-spring-calibration', classKey: 'workshop-spring-calibration', kind: 'workshop' });
		const priv = series({ id: 'private-mitte-solo', classKey: 'private', kind: 'private', capacity: 1 });
		const slots = {
			[workshop.id]: [slot('2026-10-24T12:00:00Z', 120)],
			[priv.id]: [slot('2026-10-19T06:00:00Z', 55), slot('2026-11-02T07:00:00Z', 55)],
		};
		const tt = buildTimetable([workshop, priv], slots, { now, horizonDays: 21 });
		expect(tt.some((o) => o.inferred)).toBe(false);
	});

	it('infers weekly online classes', () => {
		const online = series({ id: 'online-mat-online-mika', classKey: 'online-mat', kind: 'online', capacity: 20 });
		const slots = { [online.id]: [slot('2026-10-19T05:00:00Z', 30), slot('2026-11-02T06:00:00Z', 30)] };
		expect(buildTimetable([online], slots, { now, horizonDays: 21 }).filter((o) => o.inferred)).toHaveLength(1);
	});
});

describe('queries', () => {
	const now = Date.parse('2026-10-18T12:00:00Z');
	const flowMitte = series({ id: 'flow-mitte-lena', classKey: 'flow' });
	const flowKreuzberg = series({
		id: 'flow-kreuzberg-amara',
		classKey: 'flow',
		studio: { id: 'loc-kreuzberg', slug: 'tensile-kreuzberg', key: 'kreuzberg', name: 'Tensile Kreuzberg', short: 'Kreuzberg', online: false },
		instructor: { id: 'staff-amara', slug: 'amara-okafor', name: 'Amara Okafor', firstName: 'Amara', image: null },
	});
	const tower = series({ id: 'tower-mitte-elif', classKey: 'tower', capacity: 6 });
	const tt = buildTimetable(
		[flowMitte, flowKreuzberg, tower],
		{
			[flowMitte.id]: [slot('2026-10-19T16:45:00Z', 50, 0), slot('2026-11-02T17:45:00Z', 50)],
			[flowKreuzberg.id]: [slot('2026-10-27T05:15:00Z', 50, 10, 10), slot('2026-10-28T06:15:00Z', 50, 9, 10)],
			[tower.id]: [slot('2026-10-21T05:00:00Z', 55, 1, 6)],
		},
		{ now, horizonDays: 21 },
	);

	it('finds the next class of the same type with a free bed, any studio', () => {
		const full = tt.find((o) => o.inferred && o.seriesId === flowMitte.id)!;
		expect(full.localDate).toBe('2026-10-26');
		const next = nextWithSpace(full, tt)!;
		// Kreuzberg 27 Oct is full (10/10), so the next with space is Kreuzberg 28 Oct
		expect(next.seriesId).toBe(flowKreuzberg.id);
		expect(next.localDate).toBe('2026-10-28');
		expect(next.seatsLeft).toBe(1);
	});

	it('returns null when nothing later has space', () => {
		const towerOcc = tt.find((o) => o.classKey === 'tower')!;
		expect(nextWithSpace(towerOcc, tt)).toBeNull();
	});

	it('filters by studio, class, level, instructor and time of day', () => {
		expect(filterOccurrences(tt, { studio: 'kreuzberg' }).every((o) => o.studioKey === 'kreuzberg')).toBe(true);
		// Tower: Wed 21 Oct seen, Wed 28 Oct inferred Full
		expect(filterOccurrences(tt, { class: 'tower' })).toHaveLength(2);
		expect(new Set(filterOccurrences(tt, { level: '3' }).map((o) => o.classKey))).toEqual(new Set(['tower']));
		// Amara: Tue 27 + Wed 28 Oct seen, Tue 20 + Wed 21 Oct inferred Full
		expect(filterOccurrences(tt, { instructor: 'amara-okafor' }, (s) => (s === 'amara-okafor' ? 'staff-amara' : null))).toHaveLength(4);
		expect(filterOccurrences(tt, { time: 'evening' }).every((o) => o.localTime >= '16:00')).toBe(true);
		expect(filterOccurrences(tt, {})).toHaveLength(tt.length);
	});

	it('groups by local day, keeping empty days', () => {
		const days = groupByDay(tt, localDates('2026-10-19', 3));
		expect(groupByDay([], ['2026-10-19'])).toEqual([{ date: '2026-10-19', occurrences: [] }]);
		expect(days.map((d) => [d.date, d.occurrences.length])).toEqual([
			['2026-10-19', 1],
			['2026-10-20', 1],
			['2026-10-21', 2],
		]);
	});
});
