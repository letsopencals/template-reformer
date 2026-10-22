import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';
import { SpringChip } from '@/components/motifs/spring-chip';
import { SectionIntro } from '@/components/home/section-intro';
import { formatDuration, formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import type { ClassType } from '@/lib/catalog';

/** The class types, ordered along the level path, each with its real image, spring, length and price. */
export function ClassTypes({ classTypes, currency }: { classTypes: ClassType[]; currency: string }) {
	return (
		<section aria-labelledby="classes-title" className="container-x section-y">
			<SectionIntro
				id="classes-title"
				index="03"
				eyebrow="Classes"
				title={
					<>
						Pick your <em>springs.</em>
					</>
				}
				intro="Reformer, tower, mat and live online. Every class runs at the same length every week, with the same teacher in the same room."
				action={
					<Link href="/classes" className="eyebrow link-underline text-ink">
						All classes <span aria-hidden>→</span>
					</Link>
				}
			/>
			{classTypes.length ? (
				<ul className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
					{classTypes.map((c, i) => (
						<Reveal as="li" key={c.key} delay={(i % 4) * 0.06}>
							<ClassCard classType={c} currency={currency} />
						</Reveal>
					))}
				</ul>
			) : (
				<p className="mt-12 border border-dashed border-concrete px-6 py-10 text-graphite">
					Classes appear here once they&rsquo;re published in the dashboard.
				</p>
			)}
		</section>
	);
}

function ClassCard({ classType: c, currency }: { classType: ClassType; currency: string }) {
	const tagline = c.meta?.tagline ?? c.description;
	const studios = c.studioIds.length;
	const facts = [
		c.duration > 0 ? formatDuration(c.duration) : null,
		c.fromPrice > 0 ? `from ${formatPrice(c.fromPrice, currency)}` : null,
		studios > 1 ? `${studios} studios` : null,
	].filter(Boolean);
	return (
		<Link href={`/classes/${c.key}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
			<div className="image-placeholder relative aspect-[4/5] overflow-hidden rounded-[4px]">
				<SafeImage
					src={c.images[0]}
					alt={`${c.title} at ${siteConfig.name}`}
					fill
					sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
					className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-settle)] group-hover:scale-[1.04]"
				/>
				<span className="glass absolute top-3 left-3 rounded-[2px] px-2 py-1">
					<SpringChip spring={c.spring} />
				</span>
				<span className="eyebrow absolute right-3 bottom-3 rounded-[2px] bg-ink px-2 py-1 text-paper">{c.level}</span>
			</div>
			<div className="mt-4 flex items-start justify-between gap-3">
				<h3 className="headline text-xl text-ink">{c.title}</h3>
				<span aria-hidden className="mt-1 transition-transform duration-500 ease-[var(--ease-carriage)] group-hover:translate-x-1">
					→
				</span>
			</div>
			{tagline ? <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-graphite">{tagline}</p> : null}
			{facts.length ? <p className="tabular mt-3 text-[0.78rem] text-steel">{facts.join(' · ')}</p> : null}
		</Link>
	);
}
