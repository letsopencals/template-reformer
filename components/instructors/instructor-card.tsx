import Link from 'next/link';
import { clsx } from 'clsx';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { SafeImage } from '@/components/ui/safe-image';
import type { Spring } from '@/lib/site-config';

export interface InstructorCardData {
	slug: string;
	name: string;
	image: string | null;
	bio: string | null;
	languages: string[];
	studios: string[];
	classes: Array<{ key: string; short: string; spring: Spring }>;
}

/**
 * Portrait card for the instructor grid and the "teachers" strips on class and
 * studio pages. Takes a flattened, display-only shape (never SDK staff objects).
 */
export function InstructorCard({ data: d, compact = false }: { data: InstructorCardData; compact?: boolean }) {
	return (
		<Link
			href={`/instructors/${d.slug}`}
			className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
		>
			<div className={clsx('image-placeholder rounded-[4px]', compact ? 'aspect-square' : 'aspect-[4/5]')}>
				<SafeImage
					src={d.image}
					alt={`${d.name}, portrait`}
					fill
					sizes={compact ? '(min-width: 1024px) 16vw, 45vw' : '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw'}
					className="object-cover grayscale-[35%] transition-[filter,transform] duration-700 ease-[var(--ease-settle)] group-hover:scale-[1.02] group-hover:grayscale-0"
				/>
				{d.languages.length ? (
					<span className="tabular absolute top-3 right-3 rounded-[2px] bg-paper/90 px-1.5 py-0.5 text-[0.65rem] text-ink">
						<span className="sr-only">Teaches in </span>
						{d.languages.join(' / ')}
					</span>
				) : null}
			</div>
			<p className={clsx('headline mt-4 text-ink group-hover:underline', compact ? 'text-base' : 'text-xl')}>{d.name}</p>
			{d.studios.length ? <p className="eyebrow mt-1 text-steel">{d.studios.join(' · ')}</p> : null}
			{!compact && d.bio ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-graphite">{d.bio}</p> : null}
			{d.classes.length ? (
				<ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Teaches">
					{d.classes.map((c) => (
						<li key={c.key} className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.08em] text-ink uppercase">
							<SpringCoil spring={c.spring} className="h-2.5" coils={4} />
							{c.short}
						</li>
					))}
				</ul>
			) : null}
		</Link>
	);
}
