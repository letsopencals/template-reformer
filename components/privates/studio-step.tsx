'use client';

import { clsx } from 'clsx';
import { formatWholePrice } from '@/lib/format';
import type { PrivateStudioOption } from './private-model';

function fromPrice(s: PrivateStudioOption): number | null {
	const prices = [s.solo?.price, s.duet?.price].filter((p): p is number => typeof p === 'number');
	return prices.length ? Math.min(...prices) : null;
}

/** Pick a studio: one card per studio with a private room. */
export function StudioStep({
	studios,
	selectedId,
	currency,
	teacherId = null,
	onPick,
}: {
	studios: PrivateStudioOption[];
	selectedId: string | null;
	currency: string;
	/** A deep-linked teacher: studios where they teach privates get a note. */
	teacherId?: string | null;
	onPick: (id: string) => void;
}) {
	return (
		<ul className="grid gap-3 sm:grid-cols-3" role="list">
			{studios.map((s) => {
				const price = fromPrice(s);
				const selected = s.id === selectedId;
				const teacher = teacherId ? s.instructors.find((i) => i.id === teacherId) : null;
				return (
					<li key={s.id}>
						<button
							type="button"
							aria-pressed={selected}
							onClick={() => onPick(s.id)}
							className={clsx(
								'group flex h-full w-full flex-col rounded-[4px] border bg-paper p-5 text-left transition-[border-color,transform] duration-300 ease-[var(--ease-carriage)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
								selected ? 'border-ink' : 'border-line hover:border-ink',
							)}
						>
							<span className="flex items-center justify-between gap-2">
								<span className="eyebrow text-steel">{s.room?.name ?? 'Private room'}</span>
								{teacher ? <span className="eyebrow text-ink">{teacher.firstName} teaches here</span> : null}
							</span>
							<span className="display-sm mt-3 text-ink">{s.short}</span>
							<span className="mt-2 text-sm text-graphite">{s.address}</span>
							{s.transit ? <span className="mt-1 text-sm text-steel">{s.transit}</span> : null}
							<span className="mt-auto flex items-center justify-between pt-6">
								<span className="tabular text-sm text-ink">{price !== null ? `from ${formatWholePrice(price, currency)}` : ''}</span>
								<span aria-hidden className={clsx('h-3 w-5 rounded-[2px] transition-colors', selected ? 'bg-ink' : 'border border-concrete group-hover:border-ink')} />
							</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}
