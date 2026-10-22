import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import type { LookupInstructor } from '@/lib/timetable-lookup';

/** Portrait, name, one-line bio and a link to the teacher's page. */
export function TeacherCard({ teacher }: { teacher: LookupInstructor }) {
	return (
		<section className="mt-8 flex gap-4 border-t border-line pt-6">
			<div className="image-placeholder relative h-20 w-16 shrink-0 rounded-[2px]">
				<SafeImage src={teacher.image} alt={teacher.name} fill sizes="64px" className="object-cover" />
			</div>
			<div className="min-w-0">
				<p className="eyebrow text-graphite">Your teacher</p>
				<p className="headline mt-1 text-lg text-ink">{teacher.name}</p>
				{teacher.bio ? <p className="mt-1 text-sm leading-relaxed text-graphite">{teacher.bio}</p> : null}
				<p className="mt-2 flex flex-wrap items-center gap-3 text-xs">
					{teacher.languages.length > 0 ? <span className="tabular text-steel">{teacher.languages.join(' / ')}</span> : null}
					<Link href={`/instructors/${teacher.slug}`} className="link-underline text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
						More about {teacher.firstName}
					</Link>
				</p>
			</div>
		</section>
	);
}
