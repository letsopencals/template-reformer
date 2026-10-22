import type { Occurrence, TimeOfDay } from '@/lib/timetable';

/**
 * Timetable URL state: the filters, the selected day and the open class sheet.
 * Pure, so RSC pages (home, class, studio and instructor pages) build links with
 * `timetableHref()` and the timetable reads them back with
 * `parseTimetableParams()`. Contract in CLAUDE.md ("Timetable URLs").
 *
 * - `studio`: studio key (`mitte`), `class`: class key (`flow`),
 *   `level`: level order 0–3, `instructor`: staff slug (`lena-hoffmann`),
 *   `time`: `morning` | `midday` | `evening`, `day`: Berlin `YYYY-MM-DD`.
 * - `occ`: `<seriesSlug>@<startISO>` opens that class's sheet.
 */

export interface TimetableParams {
	studio: string | null;
	class: string | null;
	level: number | null;
	instructor: string | null;
	time: TimeOfDay | null;
	day: string | null;
	occ: OccRef | null;
}

export interface OccRef {
	seriesSlug: string;
	/** UTC ISO start, as in `Occurrence.start`. */
	start: string;
}

export type FilterKey = 'studio' | 'class' | 'level' | 'instructor' | 'time';
export const FILTER_KEYS: readonly FilterKey[] = ['studio', 'class', 'level', 'instructor', 'time'];

export const EMPTY_PARAMS: TimetableParams = {
	studio: null,
	class: null,
	level: null,
	instructor: null,
	time: null,
	day: null,
	occ: null,
};

const TIMES: readonly TimeOfDay[] = ['morning', 'midday', 'evening'];
const KEY_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

type ParamSource = URLSearchParams | { get(name: string): string | null } | Record<string, string | string[] | undefined>;

function read(src: ParamSource, name: string): string | null {
	if (typeof (src as URLSearchParams).get === 'function') return (src as URLSearchParams).get(name);
	const v = (src as Record<string, string | string[] | undefined>)[name];
	return (Array.isArray(v) ? v[0] : v) ?? null;
}

function slugParam(v: string | null): string | null {
	const s = v?.trim().toLowerCase();
	return s && KEY_RE.test(s) ? s : null;
}

/** `flow-mitte-lena@2026-10-27T17:30:00.000Z` → ref, or null when malformed. */
export function parseOccParam(v: string | null | undefined): OccRef | null {
	if (!v) return null;
	const at = v.lastIndexOf('@');
	if (at <= 0) return null;
	const seriesSlug = slugParam(v.slice(0, at));
	const start = v.slice(at + 1);
	const ms = Date.parse(start);
	if (!seriesSlug || !Number.isFinite(ms) || !start.includes('T')) return null;
	return { seriesSlug, start: new Date(ms).toISOString() };
}

export function occParam(o: Pick<Occurrence, 'seriesSlug' | 'start'>): string {
	return `${o.seriesSlug}@${o.start}`;
}

/** Read and validate every timetable param. Unknown or malformed values become null. */
export function parseTimetableParams(src: ParamSource): TimetableParams {
	const level = read(src, 'level');
	const levelNum = level !== null && /^\d$/.test(level) ? Number(level) : null;
	const time = read(src, 'time') as TimeOfDay | null;
	const day = read(src, 'day');
	return {
		studio: slugParam(read(src, 'studio')),
		class: slugParam(read(src, 'class')),
		level: levelNum,
		instructor: slugParam(read(src, 'instructor')),
		time: time && TIMES.includes(time) ? time : null,
		day: day && DAY_RE.test(day) && Number.isFinite(Date.parse(`${day}T00:00:00Z`)) ? day : null,
		occ: parseOccParam(read(src, 'occ')),
	};
}

export interface TimetableHrefInput extends Partial<Omit<TimetableParams, 'occ'>> {
	/** An occurrence (or ref) to open in the class sheet; also sets `day`. */
	occ?: (Pick<Occurrence, 'seriesSlug' | 'start'> & { localDate?: string }) | OccRef | null;
}

/** Query string (with a leading `?`, or empty) for the given state. */
export function timetableSearch(input: TimetableHrefInput): string {
	const q = new URLSearchParams();
	for (const key of FILTER_KEYS) {
		const v = input[key];
		if (v !== null && v !== undefined && v !== '') q.set(key, String(v));
	}
	const day = input.day ?? (input.occ && 'localDate' in input.occ ? input.occ.localDate : null);
	if (day) q.set('day', day);
	if (input.occ) q.set('occ', occParam(input.occ));
	const s = q.toString();
	return s ? `?${s}` : '';
}

/** `/timetable?...` link. `timetableHref({ occ })` deep-links a class sheet. */
export function timetableHref(input: TimetableHrefInput = {}): string {
	return `/timetable${timetableSearch(input)}`;
}

/** How many filters are set (for the "Filters (2)" badge). */
export function activeFilterCount(p: Pick<TimetableParams, FilterKey>): number {
	return FILTER_KEYS.filter((k) => p[k] !== null && p[k] !== undefined).length;
}
