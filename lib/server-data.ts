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
import { allSeries, buildCatalog, type Catalog, type ClassSeries } from '@/lib/catalog';
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

/** Thrown inside the cached loaders so a partial fan-out is never stored. */
class PartialAvailabilityError extends Error {}

const RETRY_DELAYS_MS = [400, 1200];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Merged availability for one series, retried on failure (429s during a fan-out are the usual cause). */
async function fetchSeriesSlots(productId: string): Promise<CurrentAvailabilitySlot[] | null> {
	for (let attempt = 0; ; attempt++) {
		try {
			// One call returns the whole booking horizon (one range per class).
			const { data } = await ProductService.getCurrentAvailabilitiesMerged({ path: { productId } });
			return Array.isArray(data) ? data : [];
		} catch (error) {
			const delay = RETRY_DELAYS_MS[attempt];
			if (delay === undefined) {
				console.warn(`[timetable] availability failed for product ${productId}`, error);
				return null;
			}
			await sleep(delay);
		}
	}
}

/**
 * Fan out over the series. With `strict`, any series that still fails after
 * retries throws, so `unstable_cache` keeps its previous entry instead of
 * caching a timetable with holes; the uncached fallback renders what it got.
 */
async function loadOccurrences(series: ClassSeries[], strict: boolean, horizonDays?: number): Promise<Occurrence[]> {
	const results = await mapLimit(series, CONCURRENCY, async (s) => [s.id, await fetchSeriesSlots(s.id)] as const);
	if (strict && results.some(([, slots]) => slots === null)) throw new PartialAvailabilityError();
	const slots = Object.fromEntries(results.map(([id, list]) => [id, list ?? []]));
	return buildTimetable(series, slots, { now: Date.now(), ...(horizonDays ? { horizonDays } : {}) });
}

/** Group classes, online classes and workshops. Privates are live studio-hours slots: the privates wizard reads them itself. */
async function timetableSeries(): Promise<ClassSeries[]> {
	return allSeries(await getCatalog()).filter((s) => s.kind !== 'private');
}

const cachedTimetable = unstable_cache(async () => loadOccurrences(await timetableSeries(), true), ['tensile-timetable-v2'], {
	revalidate: 300,
});

/**
 * Every class occurrence in the booking window (21 days), including inferred
 * Full ones (see lib/timetable.ts). Cached for 5 minutes across requests: one
 * fan-out (one availability request per series, 6 at a time) serves every
 * visitor. If a series can't be read, this request renders uncached with what
 * it has and the next one tries again. Filter with the helpers in lib/timetable.ts.
 */
export const getTimetable = cache(async (): Promise<Occurrence[]> => {
	try {
		return await cachedTimetable();
	} catch (error) {
		if (!(error instanceof PartialAvailabilityError)) throw error;
		return loadOccurrences(await timetableSeries(), false);
	}
});

/* ---------------------------------------------------------------- Workshops */

/** Workshops are dated and sell further ahead than the 21-day class window (seeded up to 45 days). */
const WORKSHOP_HORIZON_DAYS = 60;

async function workshopSeries(): Promise<ClassSeries[]> {
	return (await getCatalog()).workshops.flatMap((w) => w.series);
}

// Workshops are never inferred Full: a sold-out date just isn't returned.
const cachedWorkshops = unstable_cache(
	async () => loadOccurrences(await workshopSeries(), true, WORKSHOP_HORIZON_DAYS),
	['tensile-workshops-v2'],
	{ revalidate: 300 },
);

/**
 * Every bookable workshop date over the next 60 days (`getTimetable` stops at
 * the 21-day class window). Cached for 5 minutes like the timetable.
 */
export const getWorkshopOccurrences = cache(async (): Promise<Occurrence[]> => {
	try {
		return await cachedWorkshops();
	} catch (error) {
		if (!(error instanceof PartialAvailabilityError)) throw error;
		return loadOccurrences(await workshopSeries(), false, WORKSHOP_HORIZON_DAYS);
	}
});
