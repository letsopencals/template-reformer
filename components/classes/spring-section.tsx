import { SpringCoil } from '@/components/motifs/spring-chip';
import { Reveal } from '@/components/motion/reveal';
import type { ClassType } from '@/lib/catalog';
import type { SpringGroup } from './directory';
import { ClassCard } from './class-card';

/** One spring band on /classes: the spring's name and meaning, then its classes. */
export function SpringSection({
	group,
	index,
	studioNames,
}: {
	group: SpringGroup<ClassType>;
	index: number;
	/** Class key → short studio names. */
	studioNames: Record<string, string[]>;
}) {
	const id = `spring-${group.spring}`;
	return (
		<section aria-labelledby={id} className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-12">
			<Reveal className="lg:sticky lg:top-28 lg:self-start">
				<p className="eyebrow tabular text-steel">0{index + 1}</p>
				<h2 id={id} className="display-sm mt-3 text-ink">
					{group.info.intensity}
				</h2>
				<p className="mt-3 flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.1em] text-graphite uppercase">
					<SpringCoil spring={group.spring} coils={7} className="h-4" />
					{group.info.label}
				</p>
				<p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-graphite">{group.info.meaning}.</p>
			</Reveal>
			<ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{group.items.map((c, i) => (
					<Reveal as="li" key={c.key} delay={Math.min(i, 3) * 0.06}>
						<ClassCard classType={c} studioNames={studioNames[c.key] ?? []} />
					</Reveal>
				))}
			</ul>
		</section>
	);
}
