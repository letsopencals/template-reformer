import type { Catalog } from '@/lib/catalog';
import type { RoomMeta, Spring } from '@/lib/site-config';

/**
 * The slice of the catalog the timetable and the class sheet need on the
 * client: filter options, instructor portraits and bios, class copy, rooms and
 * each series' images and cancel gap. Plain JSON, built on the server from
 * `getCatalog()` so the full catalog never ships to the browser.
 */

export interface LookupStudio {
	id: string;
	key: string;
	name: string;
	short: string;
	online: boolean;
}

export interface LookupInstructor {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
	bio: string | null;
	languages: string[];
}

export interface LookupClass {
	key: string;
	short: string;
	title: string;
	spring: Spring;
	level: string;
	levelOrder: number;
	tagline: string | null;
	whatToBring: string[];
	prerequisite: string | null;
	images: string[];
}

export interface LookupSeries {
	images: string[];
	cancelGap: number;
	room: RoomMeta | null;
	instructorSlug: string | null;
}

export interface TimetableLookup {
	studios: LookupStudio[];
	instructors: LookupInstructor[];
	classes: LookupClass[];
	/** By series (variant) id. */
	series: Record<string, LookupSeries>;
	starterKeys: string[];
	/** Distinct level steps present, ordered: `[{ order: 0, label: 'Foundations' }, ...]`. */
	levels: Array<{ order: number; label: string }>;
}

export function buildTimetableLookup(catalog: Catalog): TimetableLookup {
	const groups = [...catalog.classTypes, ...catalog.workshops];
	const series: Record<string, LookupSeries> = {};
	for (const ct of groups) {
		for (const s of ct.series) {
			series[s.id] = { images: s.images, cancelGap: s.cancelGap, room: s.room, instructorSlug: s.instructor?.slug ?? null };
		}
	}
	const levels = new Map<number, Set<string>>();
	for (const ct of catalog.classTypes) {
		if (ct.levelOrder >= 99) continue;
		if (!levels.has(ct.levelOrder)) levels.set(ct.levelOrder, new Set());
		levels.get(ct.levelOrder)!.add(ct.level);
	}
	return {
		studios: catalog.studios.map(({ id, key, name, short, online }) => ({ id, key, name, short, online })),
		instructors: catalog.instructors.map((i) => ({
			id: i.id,
			slug: i.slug,
			name: i.name,
			firstName: i.firstName,
			image: i.image,
			bio: i.meta?.bio ?? null,
			languages: i.meta?.languages ?? [],
		})),
		classes: groups.map((ct) => ({
			key: ct.key,
			short: ct.meta?.short ?? ct.title,
			title: ct.title,
			spring: ct.spring,
			level: ct.level,
			levelOrder: ct.levelOrder,
			tagline: ct.meta?.tagline ?? ct.workshopMeta?.tagline ?? null,
			whatToBring: ct.meta?.whatToBring ?? ct.workshopMeta?.whatToBring ?? [],
			prerequisite: ct.meta?.prerequisite ?? null,
			images: ct.images,
		})),
		series,
		starterKeys: catalog.starterKeys,
		levels: [...levels.entries()].sort(([a], [b]) => a - b).map(([order, labels]) => ({ order, label: levelLabel([...labels]) })),
	};
}

/** "Foundations" + "All levels" at the same order reads "Foundations & all levels". */
export function levelLabel(labels: string[]): string {
	const named = labels.filter((l) => l !== 'All levels');
	if (named.length === 0) return labels[0] ?? 'All levels';
	return named.length < labels.length ? `${named.join(' / ')} & all levels` : named.join(' / ');
}
