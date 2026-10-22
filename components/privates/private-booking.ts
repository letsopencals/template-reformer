import type { ClassSeries } from '@/lib/catalog';
import { localParts } from '@/lib/timetable';
import { siteConfig } from '@/lib/site-config';
import { peopleFor, utcMs, type PrivateTime } from './private-model';

/**
 * The `/api/book` body (shared with the workshops page) and booking display
 * helpers. Pure; tested in `private-model.test.ts`.
 */

/* ---------------------------------------------------------------- Booking */

export interface BookingBody {
	slot: {
		productId: string;
		fromDate: string;
		fromTime: string;
		toDate: string;
		toTime: string;
		staffMemberId: string | null;
		locationId: string | null;
	};
	numberOfAttendees: number;
	addOns: Array<{ addOnId: string; quantity: number }>;
	people?: 1 | 2;
}

/**
 * The `/api/book` body for a private. "First available" (`instructorId` null)
 * books the first teacher the API says is free at that start.
 */
export function privateBookingBody(input: {
	series: Pick<ClassSeries, 'id' | 'privateFormat' | 'duration'>;
	studioId: string;
	time: PrivateTime;
	instructorId: string | null;
	addOns: Map<string, number>;
}): BookingBody {
	const { series, studioId, time, instructorId, addOns } = input;
	const { fromDate, fromTime } = time.slot;
	// The end is start + the session length (a slot's own end can be its window's end).
	const end = series.duration > 0 ? new Date(utcMs(fromDate, fromTime) + series.duration * 1000).toISOString() : null;
	const toDate = end ? end.slice(0, 10) : time.slot.toDate;
	const toTime = end ? end.slice(11, 19) : time.slot.toTime;
	return {
		slot: {
			productId: series.id,
			fromDate,
			fromTime,
			toDate,
			toTime,
			staffMemberId: instructorId ?? time.staffIds[0] ?? null,
			locationId: studioId,
		},
		numberOfAttendees: 1,
		addOns: [...addOns.entries()].filter(([, q]) => q > 0).map(([addOnId, quantity]) => ({ addOnId, quantity })),
		people: peopleFor(series.privateFormat ?? 'solo'),
	};
}

/* ---------------------------------------------------------------- Display */

const DAY_LABEL = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: siteConfig.timezone });

/** "Tue 27 Oct · 18:00–18:55", Berlin time. */
export function formatWhen(startIso: string, durationSec: number): string {
	const start = Date.parse(startIso);
	const day = DAY_LABEL.format(start).replace(',', '');
	const from = localParts(start).time;
	return durationSec > 0 ? `${day} · ${from}–${localParts(start + durationSec * 1000).time}` : `${day} · ${from}`;
}

