import { classMeta, siteConfig, studioMeta } from '@/lib/site-config';
import type { LevelPathResult } from '@/lib/level-path';
import type { BookingView } from '@/components/account/booking-view';

/**
 * Pure summaries for the account page: the bookings split into upcoming / past,
 * the level-path sentence and the studios a customer has been to.
 */

/** Upcoming = scheduled and not yet ended (soonest first). Past = ended, not cancelled (latest first). */
export function splitBookings(views: BookingView[], now: number): { upcoming: BookingView[]; past: BookingView[]; cancelled: BookingView[] } {
	const upcoming: BookingView[] = [];
	const past: BookingView[] = [];
	const cancelled: BookingView[] = [];
	for (const v of views) {
		if (v.status === 'canceled') cancelled.push(v);
		else if (v.status === 'completed' || v.end <= now) past.push(v);
		else if (v.status === 'scheduled') upcoming.push(v);
	}
	upcoming.sort((a, b) => a.start - b.start);
	past.sort((a, b) => b.start - a.start);
	cancelled.sort((a, b) => b.start - a.start);
	return { upcoming, past, cancelled };
}

function classLabel(key: string): string {
	return classMeta(key)?.short ?? siteConfig.levels.find((s) => s.key === key)?.label ?? key;
}

function plural(n: number, word: string): string {
	return `${n} ${word} ${n === 1 ? 'class' : 'classes'}`;
}

/**
 * One sentence for where the customer is on the path:
 * "3 more Flow classes to unlock Sculpt", or the next step to try.
 */
export function levelSentence(result: LevelPathResult): string {
	const { next, current, steps } = result;
	const anyDone = steps.some((s) => s.status === 'done');
	if (!anyDone) return `Start with ${steps[0]?.step.label ?? 'Foundations'}. Everything else builds on it.`;
	if (next?.progress) {
		const left = Math.max(0, next.progress.required - next.progress.count);
		const from = next.step.requires?.classKeys.map(classLabel).join(' or ') ?? '';
		return `${plural(left, `more ${from}`)} to unlock ${next.step.label}.`;
	}
	const open = steps.find((s) => s.status === 'unlocked');
	if (open) return `${open.step.label} is open to you. Book one when you’re ready.`;
	return `You’ve taken every level${current ? `, ${current.step.label} included` : ''}. The springs only get heavier from here.`;
}

export interface StudioVisit {
	slug: string;
	name: string;
	online: boolean;
	count: number;
}

/** Studios (and Tensile at Home) from past bookings, most visited first. */
export function studiosVisited(past: Pick<BookingView, 'studioSlug' | 'locationTitle' | 'isOnline'>[]): StudioVisit[] {
	const map = new Map<string, StudioVisit>();
	for (const b of past) {
		const slug = b.studioSlug ?? b.locationTitle;
		if (!slug) continue;
		const meta = studioMeta(b.studioSlug);
		const prev = map.get(slug);
		if (prev) prev.count += 1;
		else map.set(slug, { slug, name: meta?.short ?? b.locationTitle ?? slug, online: b.isOnline || !!meta?.online, count: 1 });
	}
	return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
