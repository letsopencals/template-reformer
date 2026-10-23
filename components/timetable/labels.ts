import type { Occurrence } from '@/lib/timetable';
import { classMeta, siteConfig, studioMetaByKey, type RoomMeta } from '@/lib/site-config';
import { formatWholePrice } from '@/lib/format';

/** Display labels for an occurrence, from site-config only (server and client safe). */

export function classShort(o: Pick<Occurrence, 'classKey' | 'title'>): string {
	return classMeta(o.classKey)?.short ?? o.title.split(':')[0]?.trim() ?? o.title;
}

export function roomOf(o: Pick<Occurrence, 'studioKey' | 'roomKey'>): RoomMeta | null {
	const studio = studioMetaByKey(o.studioKey);
	return studio?.rooms.find((r) => r.key === o.roomKey) ?? null;
}

export function studioShort(o: Pick<Occurrence, 'studioKey' | 'variantTitle'>): string {
	return studioMetaByKey(o.studioKey)?.short ?? o.variantTitle.split('·')[0]?.trim() ?? '';
}

/** "Mitte, Long Room" / "Online". */
export function placeLabel(o: Pick<Occurrence, 'studioKey' | 'roomKey' | 'variantTitle' | 'kind'>): string {
	if (o.kind === 'online') return 'Online, live';
	const room = roomOf(o);
	const studio = studioShort(o);
	return room ? `${studio}, ${room.name}` : studio;
}

/** Instructor first name from "Mitte · Lena" when no lookup is at hand. */
export function instructorFromTitle(o: Pick<Occurrence, 'variantTitle'>): string {
	return o.variantTitle.split('·')[1]?.trim() ?? '';
}

/** Minutes between start and end. */
export function durationMinutes(o: Pick<Occurrence, 'start' | 'end'>): number {
	return Math.round((Date.parse(o.end) - Date.parse(o.start)) / 60_000);
}

export function money(amount: number): string {
	return Number.isInteger(amount) ? formatWholePrice(amount, siteConfig.currency) : new Intl.NumberFormat('en-GB', { style: 'currency', currency: siteConfig.currency }).format(amount);
}
