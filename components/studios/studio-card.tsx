import Link from 'next/link';
import { RevealImage } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';
import type { Studio } from '@/lib/catalog';
import { equipmentLabel } from './rooms';

/**
 * A studio on /studios: a wide photo, the name set large, address and
 * transit in mono, and the rooms as a one-line inventory.
 */
export function StudioCard({ studio, index, classCount }: { studio: Studio; index: number; classCount: number }) {
	const rooms = (studio.meta?.rooms ?? []).filter((r) => !r.private);
	const photo = studio.meta?.images[0] ?? null;
	return (
		<Link
			href={`/studios/${studio.key}`}
			className="group grid gap-6 border-t border-line pt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:gap-10"
		>
			<RevealImage className="image-placeholder aspect-[16/10] rounded-[4px]" from={index % 2 ? 'left' : 'right'}>
				<SafeImage
					src={photo}
					alt={`${studio.name}, inside the studio`}
					fill
					sizes="(min-width: 768px) 55vw, 100vw"
					className="object-cover transition-transform duration-700 ease-[var(--ease-settle)] group-hover:scale-[1.02]"
				/>
			</RevealImage>
			<div className="flex flex-col">
				<p className="eyebrow tabular text-steel">0{index + 1} · {studio.meta?.neighbourhood ?? studio.short}</p>
				<h2 className="display-md mt-3 text-ink group-hover:underline">{studio.short}</h2>
				<p className="tabular mt-4 text-sm text-ink">{studio.address}</p>
				{studio.meta?.transit ? <p className="tabular mt-1 text-sm text-graphite">{studio.meta.transit}</p> : null}
				{studio.meta?.blurb ? <p className="mt-5 max-w-md leading-relaxed text-graphite">{studio.meta.blurb}</p> : null}
				<ul className="mt-6 space-y-1 border-t border-line pt-4">
					{rooms.map((r) => (
						<li key={r.key} className="tabular flex justify-between gap-4 text-[0.8rem] text-ink">
							<span>{r.name}</span>
							<span className="text-graphite">
								{r.beds} {equipmentLabel(r.equipment, r.beds)}
							</span>
						</li>
					))}
					<li className="tabular flex justify-between gap-4 text-[0.8rem] text-ink">
						<span>Class types</span>
						<span className="text-graphite">{classCount}</span>
					</li>
				</ul>
				<span className="eyebrow mt-6 text-ink">Visit {studio.short} →</span>
			</div>
		</Link>
	);
}
