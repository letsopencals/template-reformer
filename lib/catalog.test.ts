import { describe, expect, it } from 'vitest';
import {
	buildCatalog,
	classKeyForSlug,
	findInstructor,
	findSeries,
	findStudio,
	physicalStudios,
	privatesAt,
	springFromColor,
} from '@/lib/catalog';
import { collection, group, LOC, location, STAFF, staffMember, variant } from '@/lib/test-fixtures';
import { countCompleted, levelPath } from '@/lib/level-path';

const flow = group('g-flow', 'Reformer Flow', [
	variant({ id: 'v1', slug: 'flow-mitte-lena', productId: 'g-flow', title: 'Reformer Flow', variantTitle: 'Mitte · Lena', price: 34, duration: 3000, maxAttendees: 12, loc: LOC.mitte!, staff: [STAFF.lena!] }),
	// Title deliberately misleading: studio/instructor must come from the relations
	variant({ id: 'v2', slug: 'flow-kreuzberg-mika', productId: 'g-flow', title: 'Reformer Flow', variantTitle: 'Mitte · Lena', price: 34, duration: 3000, maxAttendees: 10, loc: LOC.kreuzberg!, staff: [STAFF.mika!] }),
]);
const tower = group('g-tower', 'Tower', [
	variant({ id: 'v3', slug: 'tower-mitte-elif', productId: 'g-tower', title: 'Tower', variantTitle: 'Mitte · Elif', price: 38, duration: 3300, maxAttendees: 6, loc: LOC.mitte!, staff: [STAFF.elif!], color: 'red' }),
]);
const foundations = group('g-foundations', 'Reformer Foundations', [
	variant({ id: 'v4', slug: 'foundations-mitte-lena', productId: 'g-foundations', title: 'Reformer Foundations', variantTitle: 'Mitte · Lena', price: 32, duration: 3000, maxAttendees: 12, loc: LOC.mitte!, staff: [STAFF.lena!] }),
]);
const onlineMat = group('g-online', 'Live Online Mat', [
	variant({ id: 'v5', slug: 'online-mat-online-mika', productId: 'g-online', title: 'Live Online Mat', variantTitle: 'Online · Mika', price: 14, duration: 1800, maxAttendees: 20, loc: LOC.online!, staff: [STAFF.mika!] }),
]);
const privates = group(
	'g-private',
	'Private Session',
	[
		variant({ id: 'v6', slug: 'private-mitte-solo', productId: 'g-private', title: 'Private Session', variantTitle: 'Mitte · 1:1', price: 95, duration: 3300, maxAttendees: 1, loc: LOC.mitte!, staff: [STAFF.lena!, STAFF.jonas!] }),
		// Nested staff list truncated to one (older API); Jonas claims it from the staff side.
		variant({ id: 'v7', slug: 'private-mitte-duet', productId: 'g-private', title: 'Private Session', variantTitle: 'Mitte · Duet', price: 130, duration: 3300, maxAttendees: 1, loc: LOC.mitte!, staff: [STAFF.lena!] }),
	],
	{ maxAttendees: 1 },
);
const workshop = group('g-ws', 'Spring Calibration: Reformer Anatomy', [
	variant({ id: 'v8', slug: 'workshop-spring-calibration', productId: 'g-ws', title: 'Spring Calibration', variantTitle: 'Mitte · Lena', price: 55, duration: 7200, maxAttendees: 12, loc: LOC.mitte!, staff: [STAFF.lena!] }),
]);
const mystery = group('g-mystery', 'Barre Burn', [
	variant({ id: 'v9', slug: 'barre-burn-mitte-jonas', productId: 'g-mystery', title: 'Barre Burn', variantTitle: 'Mitte · Jonas', price: 30, duration: 2700, maxAttendees: 12, loc: LOC.mitte!, staff: [STAFF.jonas!], color: 'blue' }),
]);

const catalog = buildCatalog({
	products: [tower, flow, privates, workshop, onlineMat, foundations, mystery],
	collections: [collection('start-here', ['g-foundations']), collection('privates', ['g-private']), collection('workshops', ['g-ws'])],
	staff: [staffMember(STAFF.lena!, [LOC.mitte!]), staffMember(STAFF.mika!, [LOC.kreuzberg!, LOC.online!]), staffMember(STAFF.elif!, [LOC.mitte!]), staffMember(STAFF.jonas!, [LOC.mitte!], ['v6', 'v7'])],
	locations: [location(LOC.online!), location(LOC.kreuzberg!), location(LOC.mitte!)],
});

describe('classKeyForSlug', () => {
	it('takes the longest matching class key', () => {
		expect(classKeyForSlug('flow-mitte-lena')).toBe('flow');
		expect(classKeyForSlug('online-mat-online-mika')).toBe('online-mat');
		expect(classKeyForSlug('mat-props-kreuzberg-mika')).toBe('mat-props');
		expect(classKeyForSlug('jump-board-kreuzberg-noah')).toBe('jump-board');
		expect(classKeyForSlug('private-mitte-duet')).toBe('private');
		expect(classKeyForSlug('workshop-reformer-for-runners')).toBe('workshop-reformer-for-runners');
		expect(classKeyForSlug('barre-burn')).toBeNull();
		expect(classKeyForSlug(null)).toBeNull();
	});

	it('maps dashboard colours to springs', () => {
		expect(springFromColor('emerald')).toBe('green');
		expect(springFromColor('rose')).toBe('red');
		expect(springFromColor(null, 'blue')).toBe('blue');
	});
});

describe('buildCatalog', () => {
	it('orders group classes along the level path and keeps online classes', () => {
		expect(catalog.classTypes.map((c) => [c.key, c.kind])).toEqual([
			['foundations', 'class'],
			['online-mat', 'online'],
			['flow', 'class'],
			['tower', 'class'],
			['barre-burn', 'class'],
		]);
	});

	it('reads studio and instructor from the variant relations, not the title', () => {
		const s = findSeries(catalog, 'flow-kreuzberg-mika')!;
		expect(s.studio?.key).toBe('kreuzberg');
		expect(s.instructor?.firstName).toBe('Mika');
		expect(s.capacity).toBe(10);
		expect(s.room?.name).toBe('Canal Room');
		expect(s.room?.beds).toBe(10);
		expect(s.spring).toBe('yellow');
	});

	it('uses config springs and levels, falling back to the product colour', () => {
		const t = catalog.classTypes.find((c) => c.key === 'tower')!;
		expect([t.spring, t.level, t.levelOrder]).toEqual(['red', 'Level 3', 3]);
		expect(t.series[0]!.room?.key).toBe('tower-room');
		const unknown = catalog.classTypes.find((c) => c.key === 'barre-burn')!;
		expect([unknown.spring, unknown.meta]).toEqual(['blue', null]);
	});

	it('splits privates into solo and duet per studio', () => {
		expect(catalog.privates).toHaveLength(1);
		const { solo, duet } = privatesAt(catalog, 'loc-mitte');
		expect(solo?.price).toBe(95);
		expect(duet?.price).toBe(130);
		expect(duet?.privateFormat).toBe('duet');
		expect(solo?.instructors.map((i) => i.firstName)).toEqual(['Jonas', 'Lena']);
		expect(solo?.room?.private).toBe(true);
		expect(duet?.instructors.map((i) => i.firstName)).toEqual(['Jonas', 'Lena']);
	});

	it('recognises workshops from the collection', () => {
		expect(catalog.workshops.map((w) => [w.key, w.spring, w.level])).toEqual([['workshop-spring-calibration', 'blue', 'Workshop']]);
		expect(catalog.workshops[0]!.workshopMeta?.tagline).toMatch(/anatomy/);
	});

	it('builds studios in config order with the classes taught there', () => {
		expect(catalog.studios.map((s) => s.key)).toEqual(['mitte', 'kreuzberg', 'online']);
		expect(physicalStudios(catalog).map((s) => s.key)).toEqual(['mitte', 'kreuzberg']);
		const mitte = findStudio(catalog, 'mitte')!;
		expect(mitte.classKeys).toEqual(expect.arrayContaining(['flow', 'tower', 'foundations']));
		expect(mitte.classKeys).not.toContain('private');
		expect(mitte.meta?.rooms).toHaveLength(3);
		expect(findStudio(catalog, 'tensile-at-home')?.online).toBe(true);
	});

	it('builds instructors with bios and taught classes', () => {
		const mika = findInstructor(catalog, 'mika-tanaka')!;
		expect(mika.classKeys.sort()).toEqual(['flow', 'online-mat']);
		expect(mika.meta?.languages).toEqual(['EN']);
		expect(mika.studioIds).toEqual(expect.arrayContaining(['loc-kreuzberg', 'loc-online']));
		expect(findInstructor(catalog, 'staff-lena-hoffmann')?.firstName).toBe('Lena');
	});

	it('marks starter classes', () => {
		expect(catalog.starterKeys).toEqual(['foundations']);
	});

	it('is plain JSON (safe for unstable_cache and RSC props)', () => {
		expect(JSON.parse(JSON.stringify(catalog))).toEqual(catalog);
	});
});

describe('level path', () => {
	const now = Date.parse('2026-10-23T12:00:00Z');

	it('counts completed and past scheduled classes per class key', () => {
		const counts = countCompleted(
			[
				{ status: 'completed', to: '2026-10-01T10:00:00Z', product: { slug: 'foundations-mitte-lena' } },
				{ status: 'scheduled', to: '2026-10-20T10:00:00Z', product: { slug: 'flow-mitte-lena' } },
				{ status: 'scheduled', to: '2026-10-30T10:00:00Z', product: { slug: 'flow-mitte-lena' } },
				{ status: 'canceled', to: '2026-10-02T10:00:00Z', product: { slug: 'flow-mitte-lena' } },
				{ status: 'completed', to: '2026-10-02T10:00:00Z', product: { slug: 'private-mitte-solo' } },
			],
			now,
		);
		expect(counts).toEqual({ foundations: 1, flow: 1, private: 1 });
	});

	it('starts at Foundations for a new customer', () => {
		const r = levelPath({});
		expect(r.steps.map((s) => s.status)).toEqual(['unlocked', 'locked', 'locked', 'locked']);
		expect(r.current?.step.key).toBe('foundations');
		expect(r.next?.step.key).toBe('flow');
		expect(r.next?.progress).toEqual({ count: 0, required: 1 });
	});

	it('unlocks Sculpt after ten Flow classes and tracks progress to Tower', () => {
		const r = levelPath({ foundations: 1, flow: 10, sculpt: 4, 'jump-board': 3 });
		expect(r.steps.map((s) => s.status)).toEqual(['done', 'done', 'done', 'locked']);
		expect(r.steps[2]!.taken).toBe(7);
		expect(r.next?.step.key).toBe('tower');
		expect(r.next?.progress).toEqual({ count: 4, required: 15 });
		expect(r.current?.step.key).toBe('sculpt');
	});
});
