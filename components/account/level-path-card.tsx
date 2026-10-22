'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { CarriageRail } from '@/components/motifs/carriage-rail';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { countCompleted, levelPath, type CompletedLike, type LevelStatus } from '@/lib/level-path';
import { classMeta } from '@/lib/site-config';
import { timetableHref } from '@/lib/timetable-url';
import { levelSentence } from '@/components/account/account-insights';

const STATUS_LABEL: Record<LevelStatus, string> = { done: 'Taken', unlocked: 'Open to you', locked: 'Locked' };

/**
 * The level path from the customer's own classes: Foundations → Flow → Sculpt
 * → Tower. Guidance only; nothing is ever blocked. The rail shows progress
 * toward the next locked step.
 */
export function LevelPathCard({ appointments, now }: { appointments: CompletedLike[]; now: number }) {
	const result = useMemo(() => levelPath(countCompleted(appointments, now)), [appointments, now]);
	const next = result.next;
	const ratio = next?.progress ? next.progress.count / Math.max(1, next.progress.required) : 1;
	const suggest = result.steps.find((s) => s.status === 'unlocked') ?? result.current;
	const suggestKey = suggest?.step.classKeys[0] ?? null;

	return (
		<section aria-labelledby="level-heading" className="rounded-[4px] border border-line bg-paper p-6">
			<p id="level-heading" className="eyebrow text-steel">
				Level path
			</p>
			<p className="headline mt-3 text-lg leading-snug text-ink">{levelSentence(result)}</p>

			{next?.progress ? (
				<div className="mt-5">
					<CarriageRail value={ratio} label={`${next.progress.count} of ${next.progress.required} toward ${next.step.label}`} />
					<p className="tabular mt-2 text-xs text-graphite">
						{next.progress.count} / {next.progress.required} toward {next.step.label}
					</p>
				</div>
			) : null}

			<ol className="mt-6 grid grid-cols-4 gap-2">
				{result.steps.map((s) => {
					const spring = classMeta(s.step.classKeys[0])?.spring ?? 'green';
					return (
						<li key={s.step.key} className={clsx('border-t-2 pt-3', s.status === 'locked' ? 'border-line' : 'border-ink')}>
							<SpringCoil spring={spring} className={s.status === 'locked' ? 'opacity-35' : undefined} />
							<p className={clsx('mt-2 text-[0.8rem] font-semibold', s.status === 'locked' ? 'text-steel' : 'text-ink')}>{s.step.label}</p>
							<p className="eyebrow mt-1 text-[0.6rem] text-steel">
								{STATUS_LABEL[s.status]}
								{s.taken ? ` · ${s.taken}` : ''}
							</p>
						</li>
					);
				})}
			</ol>

			{suggestKey ? (
				<Link href={timetableHref({ class: suggestKey })} className="link-underline mt-6 inline-block text-sm text-ink">
					Find a {suggest?.step.label} class <span aria-hidden>→</span>
				</Link>
			) : null}
			<p className="mt-3 text-xs leading-relaxed text-steel">A guide, not a gate. Book any class; your teacher adjusts the springs.</p>
		</section>
	);
}
