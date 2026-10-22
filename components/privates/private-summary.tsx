'use client';

import type { PrivateFormat } from '@/lib/catalog';
import { formatDuration, formatPrice } from '@/lib/format';
import { formatGap } from '@/lib/policy';
import { siteConfig, type RoomMeta } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import { RoomPlan } from '@/components/motifs/room-plan';
import { SpringChip, SPRING_VAR } from '@/components/motifs/spring-chip';

const FALLBACK_ROOM: Pick<RoomMeta, 'name' | 'beds' | 'layout' | 'equipment'> = { name: 'Private Room', beds: 2, layout: { rows: 1, cols: 2 }, equipment: 'reformer' };
const SOLO_BEDS = [0];
const DUET_BEDS = [0, 1];

export interface SummaryLine {
	label: string;
	amount: number;
}

/**
 * The booking card: the private room (one bed lit for a 1:1, two for a duet),
 * what's been picked so far, the price, and the add-to-cart action.
 */
export function PrivateSummary({
	studioName,
	room,
	format,
	teacher,
	when,
	duration,
	price,
	lines,
	cancelGap,
	currency,
	ready,
	pending,
	error,
	onBook,
}: {
	studioName: string | null;
	room: RoomMeta | null;
	format: PrivateFormat | null;
	teacher: string | null;
	when: string | null;
	duration: number;
	price: number | null;
	lines: SummaryLine[];
	cancelGap: number;
	currency: string;
	ready: boolean;
	pending: boolean;
	error: string | null;
	onBook: () => void;
}) {
	const total = (price ?? 0) + lines.reduce((s, l) => s + l.amount, 0);
	const formatLabel = format ? siteConfig.privates.formats[format].label : null;
	return (
		<aside aria-label="Your private session" className="rounded-[4px] border border-line bg-paper">
			<div className="border-b border-line p-6">
				<div className="flex items-center justify-between">
					<p className="eyebrow text-steel">{studioName ?? 'Private session'}</p>
					<SpringChip spring={siteConfig.privates.spring} />
				</div>
				<div className="mx-auto mt-6 max-w-[11rem]">
					<RoomPlan room={room ?? FALLBACK_ROOM} highlight={format === 'duet' ? DUET_BEDS : format ? SOLO_BEDS : null} highlightColor={SPRING_VAR[siteConfig.privates.spring]} />
				</div>
			</div>
			<dl className="divide-y divide-line px-6 text-sm">
				<SummaryRow label="Format" value={formatLabel ? `${formatLabel}${duration ? ` · ${formatDuration(duration)}` : ''}` : null} />
				<SummaryRow label="Teacher" value={teacher} />
				<SummaryRow label="When" value={when} />
			</dl>
			<div className="border-t border-line p-6">
				{price !== null ? (
					<ul className="space-y-1.5 text-sm" role="list">
						<li className="flex justify-between text-graphite">
							<span>{formatLabel ?? 'Session'}</span>
							<span className="tabular">{formatPrice(price, currency)}</span>
						</li>
						{lines.map((l) => (
							<li key={l.label} className="flex justify-between text-graphite">
								<span>{l.label}</span>
								<span className="tabular">{formatPrice(l.amount, currency)}</span>
							</li>
						))}
						<li className="flex justify-between border-t border-line pt-3 text-base text-ink">
							<span className="font-semibold">Total</span>
							<span className="tabular font-semibold">{formatPrice(total, currency)}</span>
						</li>
					</ul>
				) : null}
				<Button size="lg" fullWidth className="mt-5" disabled={!ready || pending} onClick={onBook} aria-busy={pending}>
					{pending ? 'Holding your room…' : ready ? 'Add to cart' : 'Pick a time to book'}
				</Button>
				{error ? (
					<p role="alert" className="mt-3 text-sm text-spring-red">
						{error}
					</p>
				) : null}
				<p className="mt-4 text-xs leading-relaxed text-steel">
					Free to cancel or move up to {formatGap(cancelGap || siteConfig.policies.cancelHours * 3600)} before.
				</p>
			</div>
		</aside>
	);
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
	return (
		<div className="flex items-baseline justify-between gap-4 py-3">
			<dt className="eyebrow text-steel">{label}</dt>
			<dd className={value ? 'text-right text-ink' : 'text-right text-concrete'}>{value ?? '—'}</dd>
		</div>
	);
}
