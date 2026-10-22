import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { SectionIntro } from '@/components/home/section-intro';
import type { Instructor } from '@/lib/catalog';

/** The teachers as a horizontal, snap-scrolling strip of portraits (staff images from the API). */
export function InstructorsStrip({ instructors }: { instructors: Instructor[] }) {
	if (!instructors.length) return null;
	return (
		<section aria-labelledby="teachers-title" className="section-y overflow-hidden">
			<div className="container-x">
				<SectionIntro
					id="teachers-title"
					index="06"
					eyebrow="Teachers"
					title={
						<>
							The people <em>calling the springs.</em>
						</>
					}
					intro="Dancers, a rower, a physio, a sprinter. Each one teaches the same classes in the same rooms every week, so you can follow a teacher you like."
					action={
						<Link href="/instructors" className="eyebrow link-underline text-ink">
							Meet everyone <span aria-hidden>→</span>
						</Link>
					}
				/>
			</div>
			<ul
				aria-label="Teachers"
				className="no-scrollbar mt-12 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 md:scroll-px-10 md:px-10 lg:mt-16 xl:px-[max(2.5rem,calc((100vw_-_1320px)/2_+_2.5rem))]"
			>
				{instructors.map((t, i) => (
					<li key={t.id} className="w-[15rem] shrink-0 snap-start sm:w-[17rem]">
						<TeacherCard teacher={t} index={i} />
					</li>
				))}
			</ul>
		</section>
	);
}

function TeacherCard({ teacher: t, index }: { teacher: Instructor; index: number }) {
	const specialities = t.meta?.specialities ?? [];
	return (
		<Link href={`/instructors/${t.slug.replace(/^staff-/, '')}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
			<div className="image-placeholder relative aspect-[3/4] overflow-hidden rounded-[4px]">
				<SafeImage
					src={t.image}
					alt={`Portrait of ${t.name}`}
					fill
					sizes="272px"
					className="object-cover grayscale-[35%] transition-[filter,transform] duration-700 ease-[var(--ease-settle)] group-hover:scale-[1.03] group-hover:grayscale-0"
				/>
				<span className="eyebrow tabular absolute top-3 left-3 text-paper mix-blend-difference">{String(index + 1).padStart(2, '0')}</span>
				{t.meta?.languages.length ? (
					<span className="eyebrow glass absolute right-3 bottom-3 rounded-[2px] px-2 py-1 text-ink">{t.meta.languages.join(' / ')}</span>
				) : null}
			</div>
			<h3 className="headline mt-4 text-lg text-ink">{t.name}</h3>
			{t.meta?.bio ? <p className="mt-1.5 line-clamp-3 text-[0.92rem] leading-relaxed text-graphite">{t.meta.bio}</p> : null}
			{specialities.length ? <p className="eyebrow mt-3 text-steel">{specialities.slice(0, 3).join(' · ')}</p> : null}
		</Link>
	);
}
