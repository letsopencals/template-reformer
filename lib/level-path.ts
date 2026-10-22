import { classKeyForSlug } from '@/lib/catalog';
import { siteConfig, type LevelStep } from '@/lib/site-config';

/**
 * The level path (Foundations → Flow → Sculpt → Tower), computed from a
 * customer's completed bookings. Pure, tested in `lib/level-path.test.ts`.
 *
 * A step is `done` once the customer has taken at least one class of it,
 * `unlocked` when its requirement is met (or it has none), otherwise `locked`.
 * The path never blocks booking; it's guidance copy only.
 */

export type LevelStatus = 'done' | 'unlocked' | 'locked';

export interface LevelProgress {
	step: LevelStep;
	status: LevelStatus;
	/** Classes taken that count as this step. */
	taken: number;
	/** Progress toward unlocking: classes taken in the required class keys. */
	progress: { count: number; required: number } | null;
}

export interface LevelPathResult {
	steps: LevelProgress[];
	/** The furthest unlocked step: where the customer is now. */
	current: LevelProgress | null;
	/** The next locked step, with its progress. */
	next: LevelProgress | null;
}

/** Minimal appointment shape: product slug, status and end time. */
export interface CompletedLike {
	status?: string | null;
	to?: string | null;
	product?: { slug?: string | null } | null;
}

/**
 * Completed classes per class key. An appointment counts when its status is
 * `completed`, or `scheduled` and already over (seeded and real stores don't
 * always mark classes completed).
 */
export function countCompleted(appointments: CompletedLike[], now: number = Date.now()): Record<string, number> {
	const out: Record<string, number> = {};
	for (const a of appointments) {
		const over = a.status === 'completed' || (a.status === 'scheduled' && !!a.to && Date.parse(a.to) < now);
		if (!over) continue;
		const key = classKeyForSlug(a.product?.slug);
		if (!key) continue;
		out[key] = (out[key] ?? 0) + 1;
	}
	return out;
}

function sum(counts: Record<string, number>, keys: string[]): number {
	return keys.reduce((n, k) => n + (counts[k] ?? 0), 0);
}

export function levelPath(counts: Record<string, number>, steps: LevelStep[] = siteConfig.levels): LevelPathResult {
	const out: LevelProgress[] = steps.map((step) => {
		const taken = sum(counts, step.classKeys);
		const progress = step.requires
			? { count: Math.min(sum(counts, step.requires.classKeys), step.requires.count), required: step.requires.count }
			: null;
		const unlocked = !progress || progress.count >= progress.required;
		return { step, taken, progress, status: taken > 0 ? 'done' : unlocked ? 'unlocked' : 'locked' };
	});
	let current: LevelProgress | null = null;
	for (const p of out) if (p.status !== 'locked') current = p;
	return { steps: out, current, next: out.find((p) => p.status === 'locked') ?? null };
}
