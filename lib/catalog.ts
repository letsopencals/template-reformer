import type {
	LocationDetailResponse,
	ProductCollectionResponse,
	ProductListItemResponse,
	ProductListVariant,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import {
	classMeta,
	instructorMeta,
	roomFor,
	privateRoomFor,
	siteConfig,
	studioMeta,
	workshopMeta,
	type ClassMeta,
	type InstructorMeta,
	type RoomMeta,
	type Spring,
	type StudioMeta,
} from '@/lib/site-config';
import { getProductGallery } from '@/lib/format';

/**
 * The studio's catalog, derived from storefront API data. Pure functions (no
 * fetching), so RSCs, client components and tests can all use them. Every type
 * here is plain JSON (no Maps), so it survives `unstable_cache` and RSC props.
 *
 * - A **class type** is a product group (`productId`). Its key comes from the
 *   variant slugs: the longest `siteConfig.classes` key that prefixes them
 *   (`flow-mitte-lena` → `flow`). Unknown groups fall back to a slug of the title.
 * - A **series** is one variant = class × studio × instructor. The studio and
 *   instructor come from the variant's own `locations` / `staffMembers`, never
 *   from its title.
 * - The **kind** comes from collections first (`privates`, `workshops`), then
 *   the data: all-online locations → `online`, 1 seat → `private`, a
 *   `workshop-` slug → `workshop`, otherwise `class`.
 */

export type OfferingKind = 'class' | 'online' | 'private' | 'workshop';
export type PrivateFormat = 'solo' | 'duet';

export interface StudioRef {
	id: string;
	slug: string;
	/** Short key: `mitte`, `kreuzberg`, `prenzlauer-berg`, `online`. */
	key: string;
	name: string;
	short: string;
	online: boolean;
}

export interface InstructorRef {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
}

export interface ClassSeries {
	/** Variant id (the product id to book and to read availability for). */
	id: string;
	slug: string;
	/** Group key shared with the class type. */
	productId: string;
	classKey: string;
	kind: OfferingKind;
	title: string;
	/** "Mitte · Lena" */
	variantTitle: string;
	studio: StudioRef | null;
	/** First assigned instructor (group classes have exactly one). */
	instructor: InstructorRef | null;
	/** Every assigned instructor (privates list all of the studio's teachers). */
	instructors: InstructorRef[];
	/** Beds in the room = `maxAttendees`. */
	capacity: number;
	/** Major units (EUR). */
	price: number;
	/** Seconds. */
	duration: number;
	spring: Spring;
	/** Dashboard colour name. */
	color: string | null;
	images: string[];
	room: RoomMeta | null;
	/** Privates only. */
	privateFormat: PrivateFormat | null;
	/** Seconds before the start after which the slot can't be booked. */
	advanceThreshold: number;
	cancelGap: number;
}

export interface ClassType {
	key: string;
	productId: string;
	kind: OfferingKind;
	title: string;
	description: string;
	spring: Spring;
	/** "Foundations", "Level 1"... */
	level: string;
	levelOrder: number;
	/** Seconds (from the first series). */
	duration: number;
	fromPrice: number;
	images: string[];
	/** Collection slugs this class belongs to. */
	collections: string[];
	series: ClassSeries[];
	studioIds: string[];
	instructorIds: string[];
	meta: ClassMeta | null;
	/** Workshops only: tagline etc. */
	workshopMeta: { tagline: string; whatToBring: string[] } | null;
}

export interface Studio extends StudioRef {
	address: string;
	link: string | null;
	latitude: number | null;
	longitude: number | null;
	meta: StudioMeta | null;
	/** Class keys taught here. */
	classKeys: string[];
	instructorIds: string[];
}

export interface Instructor extends InstructorRef {
	lastName: string;
	studioIds: string[];
	classKeys: string[];
	meta: InstructorMeta | null;
}

export interface Catalog {
	/** Group classes (in-studio and online), ordered by level then title. */
	classTypes: ClassType[];
	/** The private-session group(s). */
	privates: ClassType[];
	workshops: ClassType[];
	studios: Studio[];
	instructors: Instructor[];
	/** Starter class keys (the `start-here` collection). */
	starterKeys: string[];
}

/* ------------------------------------------------------------------ Helpers */

export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

const CLASS_KEYS_BY_LENGTH = Object.keys(siteConfig.classes).sort((a, b) => b.length - a.length);

/**
 * The class key for a variant slug: the longest known class key that equals or
 * prefixes it (`online-mat-online-mika` → `online-mat`). Privates → `private`,
 * workshops keep their own slug. Null when nothing matches.
 */
export function classKeyForSlug(slug: string | null | undefined): string | null {
	if (!slug) return null;
	if (slug in siteConfig.workshops) return slug;
	for (const key of CLASS_KEYS_BY_LENGTH) if (slug === key || slug.startsWith(`${key}-`)) return key;
	if (slug === 'private' || slug.startsWith('private-')) return 'private';
	if (slug.startsWith('workshop-')) return slug;
	return null;
}

const COLOR_TO_SPRING: Record<string, Spring> = {
	green: 'green',
	emerald: 'green',
	lime: 'green',
	teal: 'green',
	yellow: 'yellow',
	amber: 'yellow',
	orange: 'yellow',
	blue: 'blue',
	indigo: 'blue',
	sky: 'blue',
	cyan: 'blue',
	violet: 'blue',
	red: 'red',
	rose: 'red',
};

/** Spring from a product's dashboard colour, for classes with no config entry. */
export function springFromColor(color: string | null | undefined, fallback: Spring = 'yellow'): Spring {
	return (color && COLOR_TO_SPRING[color]) || fallback;
}

function toStudioRef(loc: { id: string; slug: string; title?: string | null; type?: string | null }): StudioRef {
	const meta = studioMeta(loc.slug);
	const online = loc.type === siteConfig.locationTypes.online;
	return {
		id: loc.id,
		slug: loc.slug,
		key: meta?.key ?? (online ? 'online' : loc.slug.replace(/^tensile-/, '')),
		name: meta?.name ?? loc.title ?? loc.slug,
		short: meta?.short ?? loc.title ?? loc.slug,
		online,
	};
}

function toInstructorRef(s: {
	id: string;
	slug: string;
	firstName: string;
	lastName?: string | null;
	image?: { url?: string | null } | null;
}): InstructorRef {
	return {
		id: s.id,
		slug: s.slug,
		name: [s.firstName, s.lastName].filter(Boolean).join(' '),
		firstName: s.firstName,
		image: s.image?.url ?? null,
	};
}

function privateFormatOf(v: Pick<ProductListVariant, 'slug' | 'variantTitle'>): PrivateFormat {
	return /duet/i.test(v.slug) || /duet/i.test(v.variantTitle ?? '') ? 'duet' : 'solo';
}

function collectionsByGroup(collections: ProductCollectionResponse[]): Record<string, string[]> {
	const out: Record<string, string[]> = {};
	for (const c of collections) {
		for (const p of c.products ?? []) {
			const key = p.productId || p.id;
			(out[key] ??= []).push(c.slug);
		}
	}
	return out;
}

function kindOf(
	group: ProductListItemResponse,
	variants: ProductListVariant[],
	collections: string[],
	classKey: string | null,
): OfferingKind {
	const c = siteConfig.collections;
	if (collections.includes(c.workshops)) return 'workshop';
	if (collections.includes(c.privates)) return 'private';
	if (classKey && classKey in siteConfig.workshops) return 'workshop';
	const locs = variants.flatMap((v) => v.locations ?? []);
	if (locs.length > 0 && locs.every((l) => l.type === siteConfig.locationTypes.online)) return 'online';
	if ((group.maxAttendees ?? 1) <= 1 || classKey === 'private') return 'private';
	if (variants.some((v) => v.slug.startsWith('workshop-'))) return 'workshop';
	return 'class';
}

/** The group's own variants; a group without variants is its own single series. */
function variantsOf(group: ProductListItemResponse): ProductListVariant[] {
	if (group.variants?.length) return group.variants;
	return [
		{
			...(group as unknown as ProductListVariant),
			staffMembers: [],
			locations: [],
			images: group.image ? [group.image] : [],
		},
	];
}

/* ------------------------------------------------------------------ Builders */

export interface CatalogInput {
	products: ProductListItemResponse[];
	collections: ProductCollectionResponse[];
	staff: StaffMemberListItemResponse[];
	locations: LocationDetailResponse[];
}

/** Every series of one product group. */
export function toSeries(
	group: ProductListItemResponse,
	kind: OfferingKind,
	classKey: string,
	spring: Spring,
): ClassSeries[] {
	return variantsOf(group).map((v) => {
		const loc = v.locations?.[0] ?? null;
		const studio = loc ? toStudioRef(loc) : null;
		const instructors = (v.staffMembers ?? []).map(toInstructorRef).sort((a, b) => a.name.localeCompare(b.name));
		const room =
			kind === 'private' ? privateRoomFor(studio?.slug) : kind === 'workshop' ? null : roomFor(classKey, studio?.slug);
		return {
			id: v.id,
			slug: v.slug,
			productId: group.productId || group.id,
			classKey,
			kind,
			title: v.title || group.title,
			variantTitle: v.variantTitle ?? '',
			studio,
			instructor: instructors[0] ?? null,
			instructors,
			capacity: v.maxAttendees ?? group.maxAttendees ?? 1,
			price: v.price ?? group.price ?? 0,
			duration: v.duration ?? group.duration ?? 0,
			spring,
			color: v.color ?? group.color ?? null,
			images: getProductGallery({ imageId: v.imageId, image: v.image, images: v.images }),
			room,
			privateFormat: kind === 'private' ? privateFormatOf(v) : null,
			advanceThreshold: group.advanceScheduleThreshold ?? 0,
			cancelGap: group.cancelGap ?? 0,
		};
	});
}

/** One product group → a class type with its series. */
export function toClassType(group: ProductListItemResponse, groupCollections: string[] = []): ClassType {
	const variants = variantsOf(group);
	const slugKey = classKeyForSlug(variants[0]?.slug ?? group.slug);
	const kind = kindOf(group, variants, groupCollections, slugKey);
	const key = kind === 'private' ? (slugKey ?? 'private') : kind === 'workshop' ? (variants[0]?.slug ?? group.slug) : (slugKey ?? slugify(group.title));
	const meta = kind === 'class' || kind === 'online' ? classMeta(key) : null;
	const wMeta = kind === 'workshop' ? workshopMeta(key) : null;
	const spring: Spring =
		meta?.spring ?? wMeta?.spring ?? (kind === 'private' ? siteConfig.privates.spring : springFromColor(group.color));
	const series = toSeries(group, kind, key, spring);
	const prices = series.map((s) => s.price);
	const images = [...new Set(series.flatMap((s) => s.images))];
	return {
		key,
		productId: group.productId || group.id,
		kind,
		title: group.title,
		description: group.description ?? '',
		spring,
		level: meta?.level ?? (kind === 'workshop' ? 'Workshop' : kind === 'private' ? 'Any level' : 'All levels'),
		levelOrder: meta?.levelOrder ?? 99,
		duration: series[0]?.duration ?? group.duration ?? 0,
		fromPrice: prices.length ? Math.min(...prices) : group.price,
		images,
		collections: groupCollections,
		series,
		studioIds: [...new Set(series.map((s) => s.studio?.id).filter((x): x is string => Boolean(x)))],
		instructorIds: [...new Set(series.flatMap((s) => s.instructors.map((i) => i.id)))],
		meta,
		workshopMeta: wMeta ? { tagline: wMeta.tagline, whatToBring: wMeta.whatToBring } : null,
	};
}

const CLASS_ORDER = Object.keys(siteConfig.classes);

function byLevelThenConfig(a: ClassType, b: ClassType): number {
	if (a.levelOrder !== b.levelOrder) return a.levelOrder - b.levelOrder;
	const ia = CLASS_ORDER.indexOf(a.key);
	const ib = CLASS_ORDER.indexOf(b.key);
	if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
	return a.title.localeCompare(b.title);
}

/** The whole catalog from the four list endpoints. */
export function buildCatalog({ products, collections, staff, locations }: CatalogInput): Catalog {
	const groupCollections = collectionsByGroup(collections);
	const all = products.map((p) => toClassType(p, groupCollections[p.productId || p.id] ?? []));

	const classTypes = all.filter((c) => c.kind === 'class' || c.kind === 'online').sort(byLevelThenConfig);
	const privates = all.filter((c) => c.kind === 'private');
	const workshops = all.filter((c) => c.kind === 'workshop').sort((a, b) => a.title.localeCompare(b.title));
	const allSeries = all.flatMap((c) => c.series);

	// Staff ↔ variant from the staff side too: an older API cut nested lists to
	// one item, so a private's `staffMembers` could miss teachers. Union both.
	for (const s of allSeries) {
		for (const member of staff) {
			if (s.instructors.some((i) => i.id === member.id)) continue;
			if ((member.products ?? []).some((p) => p.id === s.id)) s.instructors.push(toInstructorRef(member));
		}
		s.instructors.sort((a, b) => a.name.localeCompare(b.name));
		s.instructor ??= s.instructors[0] ?? null;
	}

	const studioOrder = Object.keys(siteConfig.studios);
	const studios: Studio[] = locations
		.filter((l) => l.type !== siteConfig.locationTypes.delivery)
		.map((l) => {
			const ref = toStudioRef(l);
			const here = allSeries.filter((s) => s.studio?.id === l.id);
			return {
				...ref,
				address:
					l.displayAddress ||
					[l.addressLine1, l.addressLine2, [l.postalCode, l.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') ||
					studioMeta(l.slug)?.address ||
					'',
				link: l.link ?? null,
				latitude: l.latitude ?? null,
				longitude: l.longitude ?? null,
				meta: studioMeta(l.slug),
				classKeys: [...new Set(here.filter((s) => s.kind === 'class' || s.kind === 'online').map((s) => s.classKey))],
				instructorIds: [...new Set(here.flatMap((s) => s.instructors.map((i) => i.id)))],
			};
		})
		.sort((a, b) => {
			const ia = studioOrder.indexOf(a.slug);
			const ib = studioOrder.indexOf(b.slug);
			return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
		});

	const instructors: Instructor[] = staff
		.map((s) => {
			const mine = allSeries.filter((x) => x.instructors.some((i) => i.id === s.id));
			const studioIds = [
				...new Set([
					...(s.locations ?? []).map((l) => l.id),
					...mine.map((x) => x.studio?.id).filter((x): x is string => Boolean(x)),
				]),
			];
			return {
				...toInstructorRef(s),
				lastName: s.lastName ?? '',
				studioIds,
				classKeys: [...new Set(mine.filter((x) => x.kind === 'class' || x.kind === 'online').map((x) => x.classKey))],
				meta: instructorMeta(s.slug),
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));

	const starter = collections.find((c) => c.slug === siteConfig.collections.starter);
	const starterGroups = new Set((starter?.products ?? []).map((p) => p.productId || p.id));
	const starterKeys = classTypes.filter((c) => starterGroups.has(c.productId)).map((c) => c.key);

	return { classTypes, privates, workshops, studios, instructors, starterKeys };
}

/* ------------------------------------------------------------------ Queries */

/** Every bookable series in the catalog. */
export function allSeries(catalog: Catalog): ClassSeries[] {
	return [...catalog.classTypes, ...catalog.privates, ...catalog.workshops].flatMap((c) => c.series);
}

export function findClassType(catalog: Catalog, key: string): ClassType | null {
	return catalog.classTypes.find((c) => c.key === key) ?? null;
}

export function findSeries(catalog: Catalog, idOrSlug: string): ClassSeries | null {
	return allSeries(catalog).find((s) => s.id === idOrSlug || s.slug === idOrSlug) ?? null;
}

export function findStudio(catalog: Catalog, keyOrSlug: string): Studio | null {
	return catalog.studios.find((s) => s.key === keyOrSlug || s.slug === keyOrSlug) ?? null;
}

export function findInstructor(catalog: Catalog, slug: string): Instructor | null {
	const bare = slug.replace(/^staff-/, '');
	return catalog.instructors.find((i) => i.slug === slug || i.slug.replace(/^staff-/, '') === bare) ?? null;
}

/** Physical studios only (no online, no delivery). */
export function physicalStudios(catalog: Catalog): Studio[] {
	return catalog.studios.filter((s) => !s.online);
}

/** Private offerings at one studio: `{ solo, duet }` series, either may be missing. */
export function privatesAt(catalog: Catalog, studioId: string): { solo: ClassSeries | null; duet: ClassSeries | null } {
	const series = catalog.privates.flatMap((p) => p.series).filter((s) => s.studio?.id === studioId);
	return {
		solo: series.find((s) => s.privateFormat === 'solo') ?? null,
		duet: series.find((s) => s.privateFormat === 'duet') ?? null,
	};
}
