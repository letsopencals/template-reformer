import '@/lib/opencals';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
	StoreService,
	ProductService,
	ProductCollectionService,
	StaffMemberService,
	LocationService,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductCollectionResponse,
	type StaffMemberListItemResponse,
	type LocationDetailResponse,
	type CurrentAvailabilitySlot,
} from '@opencals/storefront-sdk';
import { publicPayload } from '@/lib/public-payload';
import { allSeries, buildCatalog, type Catalog } from '@/lib/catalog';
import { buildTimetable, type Occurrence } from '@/lib/timetable';

/**
 * Server-only data readers. Each is wrapped in React.cache() so repeated calls
 * within a single request are deduped. RSCs call these directly instead of
 * going through the template's own /api/* routes. Never import this module from
 * a 'use client' file — the /api/* routes remain the client/SWR data source.
 * Catalog reads pass through `publicPayload`, so staff contact fields never reach
 * RSC props.
 */

export const getStoreSettings = cache(async (): Promise<StorePublicSettings | null> => {
	try {
		const { data } = await StoreService.getStorePublicSettings();
		return data ?? null;
	} catch {
		return null;
	}
});

/**
 * The store's logo and banner (cover), as set under Storefront customisation in
 * the dashboard. Null when not set or the settings can't be loaded.
 */
export function storeImages(settings: StorePublicSettings | null): { logo: string | null; banner: string | null } {
	const s = settings?.storefrontSettings;
	return { logo: s?.logoImage?.url ?? null, banner: s?.bannerImage?.url ?? null };
}

/** Every class (product group with its variants). Empty on failure. */
export const getProducts = cache(async (locationId?: string): Promise<ProductListItemResponse[]> => {
	try {
		const { data } = await ProductService.list({ query: { take: 100, locationId } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/**
 * The booking flow needs each variant's `staffMembers` (with their `locations`)
 * and `locations` — that richer shape lives on the list response, not the
 * leaner `getBySlug` detail. So we take the catalog and return the group that
 * owns the requested slug (the group's own slug or one of its variant slugs).
 * Mirrors `app/api/products/[slug]/route.ts`.
 */
export const getProduct = cache(async (slug: string): Promise<ProductListItemResponse | null> => {
	const items = await getProducts();
	return items.find((item) => item.slug === slug || item.variants?.some((v) => v.slug === slug)) ?? null;
});

/** All visible collections (with their product references). Empty on failure. */
export const getCollections = cache(async (): Promise<ProductCollectionResponse[]> => {
	try {
		const { data } = await ProductCollectionService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getStaff = cache(async (): Promise<StaffMemberListItemResponse[]> => {
	try {
		const { data } = await StaffMemberService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getLocations = cache(async (): Promise<LocationDetailResponse[]> => {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/* ---------------------------------------------------------------- Catalog */

/**
 * The whole catalog: class types with their series (class × studio × instructor),
 * privates, workshops, studios and instructors. Pure mapping over the four list
 * reads, see lib/catalog.ts.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
	const [products, collections, staff, locations] = await Promise.all([
		getProducts(),
		getCollections(),
		getStaff(),
		getLocations(),
	]);
	return buildCatalog({ products, collections, staff, locations });
});

/* ---------------------------------------------------------------- Timetable */

/** Parallel availability calls. The storefront API allows 20 requests per second per key + IP. */
const CONCURRENCY = 6;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const out: R[] = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const i = next++;
			out[i] = await fn(items[i] as T);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return out;
}

async function loadTimetable(): Promise<Occurrence[]> {
	const catalog = await getCatalog();
	// Group classes, online classes and workshops. Privates are bookable start
	// times on studio hours, not timetable rows: the privates wizard reads them live.
	const series = allSeries(catalog).filter((s) => s.kind !== 'private');
	const slots = await mapLimit(series, CONCURRENCY, async (s) => {
		try {
			// One call returns the whole booking horizon (one range per class).
			const { data } = await ProductService.getCurrentAvailabilitiesMerged({ path: { productId: s.id } });
			return [s.id, Array.isArray(data) ? data : []] as const;
		} catch {
			return [s.id, [] as CurrentAvailabilitySlot[]] as const;
		}
	});
	return buildTimetable(series, Object.fromEntries(slots), { now: Date.now() });
}

/**
 * Every class occurrence in the booking window (21 days), including inferred
 * Full ones (see lib/timetable.ts). Cached for 5 minutes across requests: one
 * fan-out (one availability request per series, 6 at a time) serves every
 * visitor. Filter it with the helpers in lib/timetable.ts.
 */
export const getTimetable = cache(unstable_cache(loadTimetable, ['tensile-timetable-v1'], { revalidate: 300 }));

/* ---------------------------------------------------------------- Workshops */

/** Workshops are dated and sell further ahead than the 21-day class window (seeded up to 45 days). */
const WORKSHOP_HORIZON_DAYS = 60;

async function loadWorkshopOccurrences(): Promise<Occurrence[]> {
	const catalog = await getCatalog();
	const series = catalog.workshops.flatMap((w) => w.series);
	const slots = await mapLimit(series, CONCURRENCY, async (s) => {
		try {
			const { data } = await ProductService.getCurrentAvailabilitiesMerged({ path: { productId: s.id } });
			return [s.id, Array.isArray(data) ? data : []] as const;
		} catch {
			return [s.id, [] as CurrentAvailabilitySlot[]] as const;
		}
	});
	// Workshops are never inferred Full: a sold-out date just isn't returned.
	return buildTimetable(series, Object.fromEntries(slots), { now: Date.now(), horizonDays: WORKSHOP_HORIZON_DAYS });
}

/**
 * Every bookable workshop date over the next 60 days (`getTimetable` stops at
 * the 21-day class window). Cached for 5 minutes like the timetable.
 */
export const getWorkshopOccurrences = cache(
	unstable_cache(loadWorkshopOccurrences, ['tensile-workshops-v1'], { revalidate: 300 }),
);
