import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { SectionIntro } from '@/components/home/section-intro';
import { SpringCoilGraphic } from '@/components/home/spring-coil-graphic';
import { SPRING_CLASSES } from '@/components/motifs/spring-chip';
import { siteConfig, type Spring } from '@/lib/site-config';
import type { Catalog } from '@/lib/catalog';

const ORDER: Spring[] = ['green', 'yellow', 'blue', 'red'];

interface SpringLink {
	href: string;
	label: string;
}

/** Which real offerings sit on each spring: class types, then privates and workshops. */
function linksBySpring(catalog: Catalog): Record<Spring, SpringLink[]> {
	const out: Record<Spring, SpringLink[]> = { green: [], yellow: [], blue: [], red: [] };
	for (const c of catalog.classTypes) out[c.spring].push({ href: `/classes/${c.key}`, label: c.meta?.short ?? c.title });
	const privateSpring = catalog.privates[0]?.spring;
	if (privateSpring) out[privateSpring].push({ href: '/privates', label: 'Privates' });
	const workshopSpring = catalog.workshops[0]?.spring;
	if (workshopSpring) out[workshopSpring].push({ href: '/workshops', label: 'Workshops' });
	return out;
}

/**
 * The spring system: the reformer's colour-coded springs as Tensile's
 * intensity scale, with the classes that live on each one.
 */
export function SpringSystem({ catalog }: { catalog: Catalog }) {
	const links = linksBySpring(catalog);
	return (
		<section aria-labelledby="springs-title" className="border-y border-line bg-paper">
			<div className="container-x section-y">
				<SectionIntro
					id="springs-title"
					index="02"
					eyebrow="The spring system"
					title={
						<>
							Four springs. <em>One scale.</em>
						</>
					}
					intro="Every reformer has colour-coded springs, from light green to heavy red. We colour each class by the springs it mostly works on, so the timetable tells you how hard an hour will be before you book it."
				/>
				<ol className="mt-12 border-t border-line lg:mt-16">
					{ORDER.map((spring, i) => (
						<SpringRow key={spring} spring={spring} index={i} links={links[spring]} />
					))}
				</ol>
				<p className="eyebrow mt-6 text-steel">Hover a spring to load it.</p>
			</div>
		</section>
	);
}

function SpringRow({ spring, index, links }: { spring: Spring; index: number; links: SpringLink[] }) {
	const info = siteConfig.springs[spring];
	return (
		<Reveal as="li" delay={index * 0.06} className="group grid gap-6 border-b border-line py-8 transition-colors duration-300 hover:bg-plaster/50 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-4">
			<div className="lg:col-span-5">
				<SpringCoilGraphic spring={spring} />
			</div>
			<div className="lg:col-span-3">
				<p className="eyebrow text-steel">
					<span className="tabular">0{index + 1}</span> · {info.label}
				</p>
				<h3 className="display-sm mt-2 text-ink">{info.intensity}</h3>
				<p className="mt-1 text-graphite">{info.meaning}</p>
			</div>
			<div className="lg:col-span-4">
				{links.length ? (
					<ul className="flex flex-wrap gap-2" aria-label={`${info.intensity} classes`}>
						{links.map((l) => (
							<li key={l.href}>
								<Link
									href={l.href}
									className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-line bg-paper px-3 font-mono text-[0.7rem] tracking-[0.08em] text-ink uppercase transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
								>
									<span aria-hidden className={`h-2 w-2 rounded-[1px] ${SPRING_CLASSES[spring].bg}`} />
									{l.label}
								</Link>
							</li>
						))}
					</ul>
				) : (
					<p className="eyebrow text-steel">No classes on this spring yet</p>
				)}
			</div>
		</Reveal>
	);
}
