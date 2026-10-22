import { describe, expect, it } from 'vitest';
import type { ClassType, Instructor, Studio } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import type { Occurrence } from '@/lib/timetable';
import {
	dayLabel,
	filteredTimetableHref,
	groupBySpring,
	instructorCardData,
	levelStepFor,
	mapsHref,
	minutes,
	nextDays,
	occurrenceHref,
	pick,
	privatesPriceLabel,
	requirementLabel,
	stepSpring,
} from './directory';

describe('groupBySpring', () => {
	it('orders green → red and drops empty springs', () => {
		const groups = groupBySpring([
			{ key: 'tower', spring: 'red' as const },
			{ key: 'foundations', spring: 'green' as const },
			{ key: 'mat', spring: 'green' as const },
			{ key: 'sculpt', spring: 'blue' as const },
		]);
		expect(groups.map((g) => g.spring)).toEqual(['green', 'blue', 'red']);
		expect(groups[0]?.items.map((i) => i.key)).toEqual(['foundations', 'mat']);
		expect(groups[0]?.info.intensity).toBe('Gentle');
	});
});

describe('dayLabel', () => {
	it('formats a local date without timezone drift', () => {
		expect(dayLabel('2026-10-27')).toBe('Tue 27 Oct');
		expect(dayLabel('2026-03-29')).toBe('Sun 29 Mar');
	});
	it('returns bad input unchanged', () => {
		expect(dayLabel('soon')).toBe('soon');
	});
});

describe('links', () => {
	it('deep-links an occurrence into the class sheet', () => {
		const href = occurrenceHref({ seriesSlug: 'flow-mitte-lena', start: '2026-10-27T17:30:00.000Z', localDate: '2026-10-27' });
		const url = new URL(href, 'https://x.test');
		expect(url.pathname).toBe('/timetable');
		expect(url.searchParams.get('occ')).toBe('flow-mitte-lena@2026-10-27T17:30:00.000Z');
		expect(url.searchParams.get('day')).toBe('2026-10-27');
	});
	it('builds filtered timetable links and skips empty filters', () => {
		expect(filteredTimetableHref({ class: 'flow' })).toBe('/timetable?class=flow');
		expect(filteredTimetableHref({ studio: '', instructor: 'lena-hoffmann' })).toBe('/timetable?instructor=lena-hoffmann');
		expect(filteredTimetableHref({})).toBe('/timetable');
	});
	it('prefers coordinates for maps, else name and address', () => {
		const base = { name: 'Tensile Mitte', address: 'Torstraße 140, 10119 Berlin' };
		expect(mapsHref({ ...base, latitude: 52.5, longitude: 13.4 })).toContain('query=52.5%2C13.4');
		expect(mapsHref({ ...base, latitude: null, longitude: null })).toContain(encodeURIComponent('Tensile Mitte, Torstraße 140'));
	});
});

describe('level path helpers', () => {
	it('finds the step and spring of a class', () => {
		expect(levelStepFor('jump-board')?.key).toBe('sculpt');
		expect(levelStepFor('prenatal')).toBeNull();
		expect(stepSpring(siteConfig.levels[3]!)).toBe('red');
	});
	it('describes requirements', () => {
		expect(requirementLabel(siteConfig.levels[0]!)).toBeNull();
		expect(requirementLabel(siteConfig.levels[1]!)).toBe('After 1 Foundations class');
		expect(requirementLabel(siteConfig.levels[2]!)).toBe('After 10 Flow classes');
	});
});

describe('nextDays', () => {
	it('keeps empty days and drops occurrences outside the window', () => {
		const now = Date.parse('2026-10-23T08:00:00Z');
		const occ = (localDate: string) => ({ localDate, key: localDate }) as Occurrence;
		const days = nextDays([occ('2026-10-24'), occ('2026-11-05')], 7, now);
		expect(days).toHaveLength(7);
		expect(days[0]?.date).toBe('2026-10-23');
		expect(days[1]?.occurrences).toHaveLength(1);
		expect(days.flatMap((d) => d.occurrences)).toHaveLength(1);
	});
});

describe('pick', () => {
	it('keeps id order and skips unknown ids', () => {
		const all = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
		expect(pick(all, ['c', 'x', 'a']).map((x) => x.id)).toEqual(['c', 'a']);
	});
	it('formats minutes', () => {
		expect(minutes(3000)).toBe('50 min');
	});
});

describe('instructorCardData', () => {
	it('flattens an instructor to display fields only', () => {
		const instructor = {
			id: 'i1',
			slug: 'lena-hoffmann',
			name: 'Lena Hoffmann',
			firstName: 'Lena',
			lastName: 'Hoffmann',
			image: null,
			studioIds: ['s2', 's1'],
			classKeys: ['tower', 'flow'],
			meta: { bio: 'Head of teaching.', story: '', languages: ['DE', 'EN'], specialities: [] },
		} as unknown as Instructor;
		const classTypes = [
			{ key: 'flow', title: 'Reformer Flow', spring: 'yellow', meta: { short: 'Flow' } },
			{ key: 'sculpt', title: 'Reformer Sculpt', spring: 'blue', meta: null },
			{ key: 'tower', title: 'Tower', spring: 'red', meta: null },
		] as unknown as ClassType[];
		const studios = [
			{ id: 's1', short: 'Mitte' },
			{ id: 's2', short: 'Kreuzberg' },
		] as unknown as Studio[];
		const d = instructorCardData(instructor, { classTypes, studios });
		expect(d.studios).toEqual(['Kreuzberg', 'Mitte']);
		expect(d.classes).toEqual([
			{ key: 'flow', short: 'Flow', spring: 'yellow' },
			{ key: 'tower', short: 'Tower', spring: 'red' },
		]);
		expect(Object.keys(d)).not.toContain('email');
	});
});

describe('privatesPriceLabel', () => {
	it('shows the lowest price per format', () => {
		const label = privatesPriceLabel([
			{ privateFormat: 'duet', price: 130 },
			{ privateFormat: 'solo', price: 95 },
			{ privateFormat: 'solo', price: 105 },
		]);
		expect(label).toMatch(/^1:1 €95 · Duet €130$/);
		expect(privatesPriceLabel([])).toBeNull();
	});
});
