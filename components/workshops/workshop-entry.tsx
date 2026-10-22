import Link from 'next/link';
import { formatDuration } from '@/lib/format';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { SpringChip } from '@/components/motifs/spring-chip';
import { TensionCable } from '@/components/motifs/tension-cable';
import type { WorkshopListing } from './workshop-model';
import { DateBlock } from './date-block';
import { WorkshopBooking } from './workshop-booking';
import { WorkshopSoldOut } from './workshop-sold-out';

/** One workshop as an editorial row: big date, the story, and the booking panel. */
export function WorkshopEntry({ workshop: w, index }: { workshop: WorkshopListing; index: number }) {
	const where = [w.roomName, w.studio?.short].filter(Boolean).join(', ');
	const headingId = `workshop-${w.key}`;
	return (
		<article aria-labelledby={headingId} className="py-12 lg:py-16">
			<TensionCable sag={index % 2 ? 6 : 3} />
			<div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
				<Reveal className="lg:col-span-3">
					<DateBlock occurrence={w.dates[0] ?? null} more={Math.max(0, w.dates.length - 1)} />
				</Reveal>
				<Reveal className="lg:col-span-5" delay={0.06}>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
						<SpringChip spring={w.spring} />
						<span className="eyebrow text-steel">
							Workshop{w.duration ? ` · ${formatDuration(w.duration)}` : ''}
							{where ? ` · ${where}` : ''}
						</span>
					</div>
					<h2 id={headingId} className="display-md mt-4 text-ink">
						{w.title}
					</h2>
					{w.tagline ? <p className="mt-5 text-lg leading-relaxed text-ink">{w.tagline}</p> : null}
					{w.description ? <p className="mt-4 leading-relaxed text-graphite">{w.description}</p> : null}
					{w.whatToBring.length ? (
						<p className="mt-6 text-sm text-graphite">
							<span className="eyebrow mr-2 text-steel">Bring</span>
							{w.whatToBring.join(' · ')}
						</p>
					) : null}
					{w.teacher ? (
						<div className="mt-8 flex items-center gap-4 border-t border-line pt-6">
							<span className="image-placeholder relative block h-16 w-14 shrink-0 rounded-[2px]">
								<SafeImage src={w.teacher.image} alt="" fill sizes="56px" className="object-cover" />
							</span>
							<span className="min-w-0">
								<Link href={`/instructors/${w.teacher.slug}`} className="link-underline headline text-ink">
									{w.teacher.name}
								</Link>
								{w.teacher.bio ? <span className="mt-0.5 block text-sm text-graphite">{w.teacher.bio}</span> : null}
							</span>
						</div>
					) : null}
				</Reveal>
				<Reveal className="lg:col-span-4" delay={0.12}>
					<div className="lg:sticky lg:top-28">
						{w.dates.length ? <WorkshopBooking title={w.title} price={w.price} dates={w.dates} /> : <WorkshopSoldOut title={w.title} />}
					</div>
				</Reveal>
			</div>
		</article>
	);
}
