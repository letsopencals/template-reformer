import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { RoomPlan } from '@/components/motifs/room-plan';
import { SPRING_VAR, SpringChip } from '@/components/motifs/spring-chip';
import { siteConfig, type RoomMeta } from '@/lib/site-config';

/**
 * The intro offer band. Copy comes only from `siteConfig.introOffer`; the
 * discount itself is automatic at checkout. The room plan shows one bed held
 * for you in the starter class's spring colour.
 */
export function IntroOffer({ starterHref, room }: { starterHref: string; room: RoomMeta | null }) {
	const offer = siteConfig.introOffer;
	return (
		<section aria-labelledby="offer-title" className="px-2 sm:px-3">
			<div className="grain relative overflow-hidden rounded-[4px] bg-ink text-paper">
				<div className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:items-center lg:py-24">
					<Reveal className="lg:col-span-7">
						<p className="eyebrow flex items-center gap-3 text-paper/60">
							<span className="tabular">07</span>
							<span aria-hidden className="h-px w-8 bg-paper/40" />
							{offer.title}
						</p>
						<h2 id="offer-title" className="display-lg mt-6 text-paper">
							{offer.headline}
						</h2>
						<p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-paper/75">{offer.body}</p>
						<div className="mt-9 flex flex-wrap items-center gap-3">
							<Link href={starterHref} className={buttonClasses({ variant: 'inverse', size: 'lg' })}>
								Book Foundations <span aria-hidden>→</span>
							</Link>
							<Link href="/timetable" className="eyebrow link-underline px-2 py-3 text-paper/80 hover:text-paper">
								Or pick any class
							</Link>
						</div>
					</Reveal>
					{room ? (
						<Reveal delay={0.15} className="lg:col-span-5">
							<figure className="rounded-[4px] bg-paper p-5 text-ink sm:p-7">
								<figcaption className="mb-5 flex items-center justify-between gap-3">
									<span className="eyebrow text-graphite">Your first bed</span>
									<SpringChip spring={siteConfig.classes.foundations.spring} text={siteConfig.classes.foundations.short} />
								</figcaption>
								<RoomPlan room={room} highlight={Math.floor(room.beds / 2) - 1} highlightColor={SPRING_VAR[siteConfig.classes.foundations.spring]} />
							</figure>
						</Reveal>
					) : null}
				</div>
			</div>
		</section>
	);
}
