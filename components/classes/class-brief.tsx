import { Reveal } from '@/components/motion/reveal';
import type { ClassType } from '@/lib/catalog';
import { levelStepFor } from './directory';
import { SpringScale } from './spring-scale';

/**
 * The four questions people ask before a first class: what it is, who it's
 * for, what to bring and whether there's a prerequisite. Copy comes from the
 * product description and `siteConfig.classes[key]`; missing copy falls back.
 */
export function ClassBrief({ classType: c }: { classType: ClassType }) {
	const what = c.description || c.meta?.tagline || '';
	const who = c.meta?.audience ?? levelStepFor(c.key)?.description ?? `${c.level}.`;
	const bring = c.meta?.whatToBring ?? [];
	const prerequisite = c.meta?.prerequisite ?? null;
	return (
		<div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
			<dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
				<Reveal className="sm:col-span-2">
					<dt className="eyebrow text-graphite">What it is</dt>
					<dd className="mt-3 text-lg leading-relaxed whitespace-pre-line text-ink">{what || 'Description coming soon.'}</dd>
				</Reveal>
				<Reveal delay={0.05}>
					<dt className="eyebrow text-graphite">Who it&rsquo;s for</dt>
					<dd className="mt-3 leading-relaxed text-ink">{who}</dd>
				</Reveal>
				<Reveal delay={0.1}>
					<dt className="eyebrow text-graphite">Before you book</dt>
					<dd className="mt-3 leading-relaxed text-ink">{prerequisite ?? 'No prerequisite. Come as you are.'}</dd>
				</Reveal>
				<Reveal delay={0.15} className="sm:col-span-2">
					<dt className="eyebrow text-graphite">What to bring</dt>
					<dd className="mt-3">
						{bring.length ? (
							<ul className="flex flex-wrap gap-2">
								{bring.map((item) => (
									<li key={item} className="rounded-[2px] border border-line bg-paper px-3 py-1.5 text-sm text-ink">
										{item}
									</li>
								))}
							</ul>
						) : (
							<p className="text-ink">Grip socks and water.</p>
						)}
					</dd>
				</Reveal>
			</dl>
			<Reveal delay={0.1} className="self-start rounded-[4px] border border-line bg-paper p-6">
				<SpringScale spring={c.spring} />
			</Reveal>
		</div>
	);
}
