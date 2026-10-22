/**
 * Pure request guards shared by the `/api/*` routes and the login page.
 * No Next or SDK imports, so they're unit-tested in `guards.test.ts`.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date in YYYY-MM-DD (rejects 2026-02-30, 2026-13-01). */
export function isRealDate(value: unknown): value is string {
	if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
	const d = new Date(`${value}T00:00:00Z`);
	return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Integer in [min, max] from a query value; `fallback` when missing or not a number. */
export function clampInt(raw: unknown, min: number, max: number, fallback: number): number {
	const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** `take` (1–50, default 20) and `page` (1–1000, default 1) for account list routes. */
export function parsePaging(params: { get(name: string): string | null }): { take: number; page: number } {
	return { take: clampInt(params.get('take'), 1, 50, 20), page: clampInt(params.get('page'), 1, 1000, 1) };
}

/** A non-negative integer from a number or a digits-only string, else null. */
export function nonNegativeInt(v: unknown): number | null {
	if (typeof v === 'number') return Number.isInteger(v) && v >= 0 ? v : null;
	if (typeof v === 'string' && /^\d{1,3}$/.test(v.trim())) return Number(v.trim());
	return null;
}

/** Add-on selections: string ids, integer quantity 1–20, unique ids, at most 30. */
export function sanitizeAddOns(input: unknown): Array<{ addOnId: string; quantity?: number }> {
	if (!Array.isArray(input)) return [];
	const seen = new Set<string>();
	const out: Array<{ addOnId: string; quantity?: number }> = [];
	for (const a of input) {
		if (!a || typeof a !== 'object') continue;
		const src = a as Record<string, unknown>;
		const id = typeof src.addOnId === 'string' || typeof src.addOnId === 'number' ? String(src.addOnId).trim().slice(0, 64) : '';
		if (!id || seen.has(id)) continue;
		seen.add(id);
		out.push(src.quantity === undefined || src.quantity === null ? { addOnId: id } : { addOnId: id, quantity: clampInt(src.quantity, 1, 20, 1) });
		if (out.length >= 30) break;
	}
	return out;
}

/** Short string for tracking ids (gclid etc.), else undefined. */
export function shortString(v: unknown, max = 256): string | undefined {
	return typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : undefined;
}

/**
 * Same-site callback path for sign-in redirects. Rejects backslashes and
 * anything that resolves to another origin; returns path + search + hash.
 */
export function safeCallback(raw: string | undefined | null, fallback = '/account'): string {
	if (!raw || typeof raw !== 'string' || raw.includes('\\') || !raw.startsWith('/')) return fallback;
	const origin = 'http://same.origin';
	try {
		const url = new URL(raw, origin);
		if (url.origin !== origin) return fallback;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}

/** "1" or "2" people for a private session (a duet is one booking for two). */
export function sanitizePeople(v: unknown): '1' | '2' {
	return v === 2 || v === '2' ? '2' : '1';
}
