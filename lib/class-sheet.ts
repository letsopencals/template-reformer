import moment from 'moment-timezone';
import type { Occurrence } from '@/lib/timetable';
import { siteConfig } from '@/lib/site-config';

/**
 * Pure helpers behind the timetable and the class sheet: the cancellation
 * cutoff, the "same time next week" lookup, day stats for the day strip and
 * the discount price preview. Tested in `lib/class-sheet.test.ts`.
 */

const TZ = siteConfig.timezone;
const DAY_TIME = new Intl.DateTimeFormat('en-GB', {
	timeZone: TZ,
	weekday: 'short',
	day: 'numeric',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
});

/** "Tue 27 Oct, 06:30" in studio time. */
export function formatDayTime(utc: number | string): string {
	const ms = typeof utc === 'number' ? utc : Date.parse(utc);
	return DAY_TIME.format(ms).replace(/^(\w{3}),? /, '$1 ');
}

/** "Tue 27 Oct" for a local `YYYY-MM-DD`. */
export function formatLocalDate(date: string): string {
	return moment.utc(date, 'YYYY-MM-DD').format('ddd D MMM');
}

/* ---------------------------------------------------------------- Policy */

export interface CancelCutoff {
	/** Epoch ms after which the booking can't be cancelled or moved. */
	at: number;
	gapSeconds: number;
	/** True when `now` is already past the cutoff. */
	passed: boolean;
}

/** `start − gap`. A missing or zero gap falls back to `siteConfig.policies.cancelHours`. */
export function cancelCutoff(start: string, gapSeconds: number | null | undefined, now: number = Date.now()): CancelCutoff {
	const gap = gapSeconds && gapSeconds > 0 ? gapSeconds : siteConfig.policies.cancelHours * 3600;
	const at = Date.parse(start) - gap * 1000;
	return { at, gapSeconds: gap, passed: now >= at };
}

/* ---------------------------------------------------------------- Next week */

export interface NextWeek {
	/** Local date one week later. */
	date: string;
	/** The same series at the same local time, if it's in the timetable. */
	occurrence: Occurrence | null;
}

/** The same class (series), same local time, seven days later. DST-safe (local time). */
export function sameTimeNextWeek(o: Pick<Occurrence, 'seriesId' | 'localDate' | 'localTime'>, all: Occurrence[]): NextWeek {
	const date = moment.utc(o.localDate, 'YYYY-MM-DD').add(7, 'day').format('YYYY-MM-DD');
	const occurrence = all.find((x) => x.seriesId === o.seriesId && x.localDate === date && x.localTime === o.localTime) ?? null;
	return { date, occurrence };
}

/* ---------------------------------------------------------------- Day strip */

export interface DayStats {
	classes: number;
	/** Classes with at least one free bed. */
	open: number;
	taken: number;
	capacity: number;
	/** 0–1: share of all beds that day already taken. */
	fill: number;
}

export function dayStats(occurrences: Occurrence[]): DayStats {
	let open = 0;
	let taken = 0;
	let capacity = 0;
	for (const o of occurrences) {
		if (o.status !== 'full') open++;
		taken += Math.min(o.capacity, o.capacity - o.seatsLeft);
		capacity += o.capacity;
	}
	return { classes: occurrences.length, open, taken, capacity, fill: capacity > 0 ? taken / capacity : 0 };
}

/* ---------------------------------------------------------------- Prices */

export interface PricePreview {
	base: number;
	/** Off-peak price, when the class starts in the off-peak window. */
	offPeak: number | null;
	/** Price with the first-order intro offer. */
	intro: number | null;
}

const cents = (n: number) => Math.round(n * 100) / 100;

/**
 * What the automatic discounts would make this class cost. Only group classes
 * (in-studio and online) qualify; workshops and privates don't. Discounts never
 * combine (the best one wins), so these are alternatives, not a stack. The
 * cart's own totals are the truth; this is preview copy.
 */
export function pricePreview(o: Pick<Occurrence, 'price' | 'offPeak' | 'kind'>): PricePreview {
	const group = o.kind === 'class' || o.kind === 'online';
	if (!group || o.price <= 0) return { base: o.price, offPeak: null, intro: null };
	const off = o.offPeak ? cents(o.price * (1 - siteConfig.offPeak.percent / 100)) : null;
	const intro = cents(o.price * (1 - siteConfig.introOffer.percent / 100));
	return { base: o.price, offPeak: off, intro };
}
