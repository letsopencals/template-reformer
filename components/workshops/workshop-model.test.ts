import { describe, expect, it } from 'vitest';
import { buildCatalog } from '@/lib/catalog';
import { buildTimetable } from '@/lib/timetable';
import { collection, group, LOC, location, slot, STAFF, staffMember, variant } from '@/lib/test-fixtures';
import { buildWorkshopListings, dateBlock, workshopBookingBody } from './workshop-model';

const ws = (id: string, slug: string, title: string, cap: number) =>
	group(`g-${id}`, title, [variant({ id, slug, productId: `g-${id}`, title, variantTitle: 'Mitte · Lena', price: 55, duration: 7200, maxAttendees: cap, loc: LOC.mitte!, staff: [STAFF.lena!] })]);

const catalog = buildCatalog({
	products: [ws('w1', 'workshop-spring-calibration', 'Spring Calibration', 12), ws('w2', 'workshop-reformer-for-runners', 'Reformer for Runners', 10)],
	collections: [collection('workshops', ['g-w1', 'g-w2'])],
	staff: [staffMember(STAFF.lena!, [LOC.mitte!])],
	locations: [location(LOC.mitte!)],
});

const NOW = Date.parse('2026-10-23T10:00:00Z');
const series = catalog.workshops.flatMap((w) => w.series);
// w1 has two dates (one with 3 beds taken); w2 has none: sold out.
const occs = buildTimetable(series, { w1: [slot('2026-11-21T13:00:00Z', 120, 3, 12), slot('2026-11-07T13:00:00Z', 120)] }, { now: NOW, horizonDays: 60 });

describe('buildWorkshopListings', () => {
	const listings = buildWorkshopListings(catalog, occs);

	it('lists open dates soonest first, sold-out workshops last', () => {
		expect(listings.map((l) => [l.key, l.dates.map((d) => d.localDate)])).toEqual([
			['workshop-spring-calibration', ['2026-11-07', '2026-11-21']],
			['workshop-reformer-for-runners', []],
		]);
		expect(listings[0]!.dates[1]!.seatsLeft).toBe(9);
	});

	it('takes copy and the room from site-config', () => {
		const l = listings[0]!;
		expect(l.roomName).toBe('Long Room');
		expect(l.description).toMatch(/spring by spring/);
		expect(l.teacher).toMatchObject({ name: 'Lena Hoffmann', slug: 'lena-hoffmann' });
		expect(l.teacher?.bio).toMatch(/dancer/);
	});
});

describe('dateBlock and workshopBookingBody', () => {
	const o = occs[0]!;
	it('formats the big date in Berlin time', () => {
		expect(dateBlock(o)).toEqual({ day: '7', month: 'Nov', weekday: 'Sat', time: '14:00–16:00' });
	});
	it('sends the single UTC slot', () => {
		expect(workshopBookingBody(o)).toEqual({
			slot: { productId: 'w1', fromDate: '2026-11-07', fromTime: '13:00:00', toDate: '2026-11-07', toTime: '15:00:00', staffMemberId: 'staff-lena', locationId: 'loc-mitte' },
			numberOfAttendees: 1,
			addOns: [],
		});
	});
});
