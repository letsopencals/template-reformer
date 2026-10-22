import Link from 'next/link';
import { SpringChip } from '@/components/motifs/spring-chip';
import { SafeImage } from '@/components/ui/safe-image';
import type { ClassType } from '@/lib/catalog';
import { formatWholePrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { minutes } from './directory';
import { LevelPips } from './level-path';

/**
 * A class type on the /classes index: image, spring and level, the numbers
 * (duration, price from) and where it runs. The whole card is one link.
 */
export function ClassCard({ classType: c, studioNames }: { classType: ClassType; studioNames: string[] }) {
	const tagline = c.meta?.tagline ?? c.description;
	return (
		<Link
			href={`/classes/${c.key}`}
			className="group flex h-full flex-col rounded-[4px] border border-line bg-paper transition-colors duration-300 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
		>
			<div className="image-placeholder aspect-[4/3] rounded-t-[3px]">
				<SafeImage
					src={c.images[0]}
					alt=""
					fill
					sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
					className="object-cover transition-transform duration-700 ease-[var(--ease-settle)] group-hover:scale-[1.03]"
				/>
				<span className="absolute top-3 left-3 rounded-[2px] bg-paper/90 px-2 py-1">
					<SpringChip spring={c.spring} />
				</span>
			</div>
			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-center justify-between gap-3">
					<p className="eyebrow text-graphite">{c.level}</p>
					<LevelPips classKey={c.key} />
				</div>
				<h3 className="headline mt-3 text-2xl text-ink">{c.title}</h3>
				{tagline ? <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-graphite">{tagline}</p> : null}
				<dl className="tabular mt-auto grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-4 text-[0.8rem] text-ink">
					<dt className="sr-only">Duration</dt>
					<dd>{c.duration ? minutes(c.duration) : '—'}</dd>
					<dt className="sr-only">Price</dt>
					<dd className="text-right">{new Set(c.series.map((s) => s.price)).size > 1 ? 'from ' : ''}{formatWholePrice(c.fromPrice, siteConfig.currency)}</dd>
					<dt className="sr-only">Studios</dt>
					<dd className="col-span-2 mt-1 truncate text-graphite">{studioNames.length ? studioNames.join(' · ') : 'Studio to be announced'}</dd>
				</dl>
			</div>
		</Link>
	);
}
