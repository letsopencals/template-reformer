'use client';

import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { siteConfig } from '@/lib/site-config';
import type { PrivateInstructor } from './private-model';
import { FIRST_AVAILABLE } from './wizard-state';

const CARD =
	'group flex h-full w-full flex-col rounded-[4px] border bg-paper text-left transition-[border-color,transform] duration-300 ease-[var(--ease-carriage)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

/** Pick a teacher (portraits) or let the first free one take it. */
export function InstructorStep({
	instructors,
	selected,
	onPick,
}: {
	instructors: PrivateInstructor[];
	selected: string | null;
	onPick: (id: string) => void;
}) {
	return (
		<ul className="grid grid-cols-2 gap-3 md:grid-cols-3" role="list">
			<li>
				<button type="button" aria-pressed={selected === FIRST_AVAILABLE} onClick={() => onPick(FIRST_AVAILABLE)} className={clsx(CARD, selected === FIRST_AVAILABLE ? 'border-ink' : 'border-line hover:border-ink')}>
					<span className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 border-b border-line bg-plaster-deep">
						<SpringCoil spring={siteConfig.privates.spring} coils={7} className="h-5" />
						<span className="eyebrow text-graphite">Any teacher</span>
					</span>
					<span className="p-4">
						<span className="headline block text-ink">First available</span>
						<span className="mt-1 block text-sm text-graphite">The most times to choose from.</span>
					</span>
				</button>
			</li>
			{instructors.map((i) => (
				<li key={i.id}>
					<button type="button" aria-pressed={selected === i.id} onClick={() => onPick(i.id)} className={clsx(CARD, selected === i.id ? 'border-ink' : 'border-line hover:border-ink')}>
						<span className="image-placeholder relative block aspect-[4/5] w-full border-b border-line">
							<SafeImage src={i.image} alt="" fill sizes="(min-width: 768px) 220px, 45vw" className="object-cover grayscale-[15%] transition-[filter] duration-500 group-hover:grayscale-0" />
						</span>
						<span className="p-4">
							<span className="headline block text-ink">{i.name}</span>
							{i.bio ? <span className="mt-1 line-clamp-2 block text-sm text-graphite">{i.bio}</span> : null}
							{i.languages.length ? <span className="eyebrow mt-2 block text-steel">{i.languages.join(' · ')}</span> : null}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}
