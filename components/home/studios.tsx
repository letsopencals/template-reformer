import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';
import { RoomPlan } from '@/components/motifs/room-plan';
import { SectionIntro } from '@/components/home/section-intro';
import type { Studio } from '@/lib/catalog';
import { timetableHref } from '@/lib/timetable-url';
import type { RoomMeta } from '@/lib/site-config';

const NOUN: Record<RoomMeta['equipment'], [string, string]> = {
	reformer: ['reformer', 'reformers'],
	tower: ['tower', 'towers'],
	mat: ['mat', 'mats'],
};

function roomLine(r: RoomMeta): string {
	const [one, many] = NOUN[r.equipment];
	return `${r.beds} ${r.beds === 1 ? one : many}`;
}

/** The physical studios with their rooms (from site-config) and a link to each studio page. */
export function Studios({ studios, online }: { studios: Studio[]; online: Studio | null }) {
	return (
		<section aria-labelledby="studios-title" className="border-t border-line bg-plaster-deep/60">
			<div className="container-x section-y">
				<SectionIntro
					id="studios-title"
					index="05"
					eyebrow="Studios"
					title={
						<>
							Small rooms, <em>three corners of Berlin.</em>
						</>
					}
					intro="Small rooms on purpose. Your teacher can see every bed, and every class is capped at the beds in the room."
					action={
						<Link href="/studios" className="eyebrow link-underline text-ink">
							All studios <span aria-hidden>→</span>
						</Link>
					}
				/>
				{studios.length ? (
					<ul className="mt-12 grid gap-10 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
						{studios.map((s, i) => (
							<Reveal as="li" key={s.id} delay={i * 0.08}>
								<StudioCard studio={s} />
							</Reveal>
						))}
					</ul>
				) : (
					<p className="mt-12 border border-dashed border-concrete px-6 py-10 text-graphite">Studios appear here once locations are set up.</p>
				)}
				{online ? (
					<Link
						href={timetableHref({ studio: online.key })}
						className="group mt-10 flex flex-col gap-3 border-y border-line py-6 sm:flex-row sm:items-center sm:justify-between focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
					>
						<span className="flex items-baseline gap-4">
							<span className="eyebrow text-steel">Also</span>
							<span className="headline text-xl text-ink">{online.name}</span>
						</span>
						<span className="text-graphite sm:max-w-md">{online.meta?.blurb ?? 'Live classes from home.'}</span>
						<span aria-hidden className="transition-transform duration-500 ease-[var(--ease-carriage)] group-hover:translate-x-1.5">→</span>
					</Link>
				) : null}
			</div>
		</section>
	);
}

function StudioCard({ studio: s }: { studio: Studio }) {
	const rooms = (s.meta?.rooms ?? []).filter((r) => !r.private);
	const main = rooms.find((r) => r.equipment === 'reformer') ?? rooms[0] ?? null;
	const [first, second] = s.meta?.images ?? [];
	return (
		<Link href={`/studios/${s.key}`} className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
			<div className="image-placeholder relative aspect-[4/3] overflow-hidden rounded-[4px]">
				<SafeImage src={first} alt={`${s.name}, inside the studio`} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
				{second ? (
					<SafeImage
						src={second}
						alt=""
						fill
						sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
						className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
					/>
				) : null}
				<span className="eyebrow glass absolute top-3 left-3 rounded-[2px] px-2 py-1 text-ink">{s.meta?.neighbourhood ?? s.short}</span>
			</div>
			<div className="mt-5 flex items-start justify-between gap-4">
				<h3 className="display-sm text-ink">{s.short}</h3>
				{main ? <RoomPlan room={main} showLabels={false} className="w-24 shrink-0" /> : null}
			</div>
			{s.meta?.blurb ? <p className="mt-3 leading-relaxed text-graphite">{s.meta.blurb}</p> : null}
			{rooms.length ? (
				<ul className="mt-5 divide-y divide-line border-y border-line">
					{rooms.map((r) => (
						<li key={r.key} className="flex items-center justify-between py-2.5 text-[0.92rem]">
							<span className="text-ink">{r.name}</span>
							<span className="tabular text-graphite">{roomLine(r)}</span>
						</li>
					))}
				</ul>
			) : null}
			<div className="mt-auto pt-5">
				{s.address ? <p className="tabular text-[0.8rem] text-ink">{s.address}</p> : null}
				{s.meta?.transit ? <p className="mt-1 text-[0.85rem] text-steel">{s.meta.transit}</p> : null}
				<p className="eyebrow mt-4 inline-flex items-center gap-2 text-ink">
					Visit {s.short}
					<span aria-hidden className="transition-transform duration-500 ease-[var(--ease-carriage)] group-hover:translate-x-1.5">→</span>
				</p>
			</div>
		</Link>
	);
}
