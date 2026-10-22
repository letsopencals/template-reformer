import { describe, expect, it } from 'vitest';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { buildDayStrip, groupTimes, peopleFor, resolveDeepLink, slotsToTimes, type PrivateStudioOption } from './private-model';
import { formatWhen, privateBookingBody } from './private-booking';

function slot(fromDate: string, fromTime: string, staff: string[] = ['s1'], extra: Partial<CurrentAvailabilitySlot> = {}): CurrentAvailabilitySlot {
	return { productId: 'p', fromDate, fromTime, toDate: fromDate, toTime: '20:00:00', staffMemberIds: staff, locationIds: ['l'], attendees: 0, maxAttendees: 1, ...extra };
}

// 2026-10-27 is a Tuesday; Berlin is UTC+1 after the 25 Oct switch.
const NOW = Date.parse('2026-10-26T12:00:00Z');

describe('slotsToTimes', () => {
	it('keeps only starts on the picked Berlin day, after now, sorted and in local time', () => {
		const times = slotsToTimes(
			[slot('2026-10-27', '17:00:00'), slot('2026-10-27', '06:00:00'), slot('2026-10-27', '23:30:00'), slot('2026-10-25', '10:00:00')],
			{ date: '2026-10-27', now: NOW },
		);
		expect(times.map((t) => t.time)).toEqual(['07:00', '18:00']);
		expect(times.map((t) => t.part)).toEqual(['morning', 'evening']);
	});

	it('merges duplicate starts and their teachers', () => {
		const times = slotsToTimes([slot('2026-10-27', '09:00:00', ['a']), slot('2026-10-27', '09:00:00', ['b', 'a'])], { date: '2026-10-27', now: NOW });
		expect(times).toHaveLength(1);
		expect(times[0]!.staffIds).toEqual(['a', 'b']);
	});

	it('drops full slots (the shared private room is taken)', () => {
		const times = slotsToTimes([slot('2026-10-27', '09:00:00', ['a'], { attendees: 1 })], { date: '2026-10-27', now: NOW });
		expect(times).toEqual([]);
	});
});

describe('groupTimes', () => {
	it('drops empty parts of the day', () => {
		const times = slotsToTimes([slot('2026-10-27', '11:00:00')], { date: '2026-10-27', now: NOW });
		expect(groupTimes(times).map((g) => g.part)).toEqual(['midday']);
	});
});

describe('buildDayStrip', () => {
	it('starts today in Berlin and marks open days', () => {
		const late = Date.parse('2026-10-26T23:30:00Z'); // already Tue 27 in Berlin
		const strip = buildDayStrip(late, new Set(['2026-10-28']), 3);
		expect(strip.map((d) => [d.date, d.weekday, d.open])).toEqual([
			['2026-10-27', 'Tue', false],
			['2026-10-28', 'Wed', true],
			['2026-10-29', 'Thu', false],
		]);
	});

	it('marks every day unknown while loading', () => {
		expect(buildDayStrip(NOW, null, 2).every((d) => d.open === null)).toBe(true);
	});
});

describe('privateBookingBody', () => {
	const [time] = slotsToTimes([slot('2026-10-27', '09:00:00', ['first', 'second'])], { date: '2026-10-27', now: NOW });

	it('books a duet as one seat for two, ending after the session length', () => {
		const body = privateBookingBody({
			series: { id: 'duet-id', privateFormat: 'duet', duration: 3300 },
			studioId: 'loc',
			time: time!,
			instructorId: 'chosen',
			addOns: new Map([['socks', 2], ['none', 0]]),
		});
		expect(body).toEqual({
			slot: { productId: 'duet-id', fromDate: '2026-10-27', fromTime: '09:00:00', toDate: '2026-10-27', toTime: '09:55:00', staffMemberId: 'chosen', locationId: 'loc' },
			numberOfAttendees: 1,
			addOns: [{ addOnId: 'socks', quantity: 2 }],
			people: 2,
		});
	});

	it('first available takes the first free teacher', () => {
		const body = privateBookingBody({ series: { id: 'x', privateFormat: 'solo', duration: 3300 }, studioId: 'loc', time: time!, instructorId: null, addOns: new Map() });
		expect(body.slot.staffMemberId).toBe('first');
		expect(body.people).toBe(1);
		expect(peopleFor('duet')).toBe(2);
	});
});

describe('formatWhen', () => {
	it('renders Berlin day and time range', () => {
		expect(formatWhen('2026-10-27T17:00:00.000Z', 3300)).toBe('Tue 27 Oct · 18:00–18:55');
	});
});

describe('resolveDeepLink', () => {
	const teacher = (id: string, slug: string) => ({ id, slug, name: id, firstName: id, image: null, bio: null, languages: [] });
	const studio = (id: string, key: string, teachers: ReturnType<typeof teacher>[], duet = true) =>
		({ id, key, name: key, short: key, address: '', transit: null, room: null, solo: { id: `${id}-solo`, instructors: [] }, duet: duet ? { id: `${id}-duet`, instructors: [] } : null, instructors: teachers }) as unknown as PrivateStudioOption;
	const studios = [studio('m', 'mitte', [teacher('lena', 'lena-hoffmann'), teacher('elif', 'elif-yilmaz')], false), studio('k', 'kreuzberg', [teacher('lena', 'lena-hoffmann'), teacher('mika', 'staff-mika-tanaka')])];

	it('reads studio and format, ignoring a format the studio lacks', () => {
		expect(resolveDeepLink(studios, { studio: 'kreuzberg', format: 'duet' })).toEqual({ studioId: 'k', format: 'duet', instructorId: null });
		expect(resolveDeepLink(studios, { studio: 'mitte', format: 'duet' }).format).toBeNull();
		expect(resolveDeepLink(studios, { studio: 'nowhere' }).studioId).toBeNull();
	});

	it('resolves a teacher by slug and picks their only studio', () => {
		expect(resolveDeepLink(studios, { instructor: 'mika-tanaka' })).toEqual({ studioId: 'k', format: null, instructorId: 'mika' });
		expect(resolveDeepLink(studios, { instructor: 'elif-yilmaz' }).studioId).toBe('m');
		// Teaches at two studios: the visitor picks.
		expect(resolveDeepLink(studios, { instructor: 'lena-hoffmann' })).toEqual({ studioId: null, format: null, instructorId: 'lena' });
	});
});
