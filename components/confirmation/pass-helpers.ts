import { localParts, localToUtc } from '@/lib/timetable';

/**
 * Pure helpers for the check-in pass. Tested in `pass-helpers.test.ts`.
 */

/**
 * A stable bed index for drawing "your spot" in the room plan. Beds aren't
 * assigned by the API, so this is decoration only: the copy says "your spot is
 * held", never a bed number. FNV-1a over the appointment id.
 */
export function bedIndexFor(appointmentId: string, beds: number): number {
	if (beds <= 0) return 0;
	let h = 0x811c9dc5;
	for (let i = 0; i < appointmentId.length; i++) {
		h ^= appointmentId.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0) % beds;
}

/** The same local (Berlin) time one week later, DST-safe. */
export function sameTimeNextWeek(startMs: number): { date: string; time: string; start: number } {
	const { date, time } = localParts(startMs);
	const d = new Date(`${date}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 7);
	const next = d.toISOString().slice(0, 10);
	return { date: next, time, start: localToUtc(next, time) };
}

/** "Starts in 2 d 4 h", "Starts in 35 min", "On now", "Finished". */
export function countdownLabel(start: number, end: number, now: number): string {
	if (now >= end) return 'Finished';
	if (now >= start) return 'On now';
	const mins = Math.ceil((start - now) / 60_000);
	if (mins < 60) return `Starts in ${mins} min`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `Starts in ${hours} h ${mins % 60} min`;
	const days = Math.floor(hours / 24);
	return `Starts in ${days} d ${hours % 24} h`;
}

/** Google Maps search link for an address. */
export function directionsHref(address: string): string {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
