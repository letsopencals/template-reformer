'use client';

import { clsx } from 'clsx';
import type { PrivateFormat } from '@/lib/catalog';
import { formatDuration, formatWholePrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { RoomPlan } from '@/components/motifs/room-plan';
import { SPRING_VAR } from '@/components/motifs/spring-chip';
import { peopleFor, type PrivateStudioOption } from './private-model';

const FORMATS: PrivateFormat[] = ['solo', 'duet'];
const SOLO_BEDS = [0];
const DUET_BEDS = [0, 1];

/** 1:1 or Duet, each drawn as the private room with one or two beds lit. */
export function FormatStep({
	studio,
	selected,
	currency,
	onPick,
}: {
	studio: PrivateStudioOption;
	selected: PrivateFormat | null;
	currency: string;
	onPick: (format: PrivateFormat) => void;
}) {
	const room = studio.room ?? { name: 'Private Room', beds: 2, layout: { rows: 1, cols: 2 }, equipment: 'reformer' as const };
	return (
		<ul className="grid gap-3 sm:grid-cols-2" role="list">
			{FORMATS.map((format) => {
				const series = studio[format];
				const copy = siteConfig.privates.formats[format];
				const isSelected = selected === format;
				return (
					<li key={format}>
						<button
							type="button"
							disabled={!series}
							aria-pressed={isSelected}
							onClick={() => onPick(format)}
							className={clsx(
								'flex h-full w-full gap-5 rounded-[4px] border bg-paper p-5 text-left transition-[border-color,transform] duration-300 ease-[var(--ease-carriage)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50',
								isSelected ? 'border-ink' : 'border-line enabled:hover:-translate-y-0.5 enabled:hover:border-ink',
							)}
						>
							<span className="w-20 shrink-0 sm:w-24">
								<RoomPlan room={room} highlight={format === 'duet' ? DUET_BEDS : SOLO_BEDS} highlightColor={SPRING_VAR[siteConfig.privates.spring]} showLabels={false} />
							</span>
							<span className="flex min-w-0 flex-1 flex-col">
								<span className="flex items-baseline justify-between gap-3">
									<span className="display-sm text-ink">{copy.label}</span>
									<span className="tabular text-ink">{series ? formatWholePrice(series.price, currency) : ''}</span>
								</span>
								<span className="eyebrow mt-1 text-steel">
									{peopleFor(format) === 2 ? 'Two people' : 'One person'}
									{series?.duration ? ` · ${formatDuration(series.duration)}` : ''}
								</span>
								<span className="mt-3 text-sm leading-relaxed text-graphite">{series ? copy.description : `No ${copy.label.toLowerCase()} sessions at ${studio.short} yet.`}</span>
							</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}
