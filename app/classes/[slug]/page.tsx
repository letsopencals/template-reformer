import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClassBrief } from '@/components/classes/class-brief';
import { ClassFacts } from '@/components/classes/class-facts';
import { ClassGallery } from '@/components/classes/class-gallery';
import { ClassVenues } from '@/components/classes/class-venues';
import { filteredTimetableHref, instructorCardData, levelStepFor, nameIndex, nextDays, pick } from '@/components/classes/directory';
import { EmptyState } from '@/components/classes/empty-state';
import { LevelPath } from '@/components/classes/level-path';
import { OccurrenceDays } from '@/components/classes/occurrence-days';
import { SectionHead } from '@/components/classes/section-head';
import { InstructorCard } from '@/components/instructors/instructor-card';
import { PageHeading } from '@/components/ui/page-heading';
import { findClassType } from '@/lib/catalog';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { localParts, upcomingFor } from '@/lib/timetable';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

/** Days of the class's timetable shown here; the rest is one click away. */
const DAYS_SHOWN = 7;

export async function generateStaticParams() {
	const { classTypes } = await getCatalog();
	return classTypes.map((c) => ({ slug: c.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const c = findClassType(await getCatalog(), slug);
	return c ? { title: c.title, description: c.meta?.tagline ?? c.description } : {};
}

export default async function ClassPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [catalog, timetable] = await Promise.all([getCatalog(), getTimetable()]);
	const c = findClassType(catalog, slug);
	if (!c) notFound();

	const now = Date.now();
	const days = nextDays(upcomingFor(timetable, { classKey: c.key }), 21, now)
		.filter((d) => d.occurrences.length)
		.slice(0, DAYS_SHOWN);
	const teachers = pick(catalog.instructors, c.instructorIds).map((i) => instructorCardData(i, catalog));
	const names = nameIndex(catalog.studios, catalog.instructors);
	const onPath = levelStepFor(c.key) !== null;

	return (
		<>
			<PageHeading eyebrow={`Classes · ${c.level}`} title={c.title} intro={c.meta?.tagline ?? undefined}>
				<ClassFacts classType={c} />
			</PageHeading>

			<div className="container-x space-y-20 pb-24 lg:space-y-28">
				<ClassGallery images={c.images} title={c.title} spring={c.spring} />

				<section aria-label="About this class">
					<ClassBrief classType={c} />
				</section>

				{onPath ? (
					<section aria-labelledby="path">
						<SectionHead id="path" eyebrow="Level path" title="Where this sits" />
						<LevelPath activeKey={c.key} />
					</section>
				) : null}

				<section aria-labelledby="where">
					<SectionHead id="where" eyebrow="Studios" title="Where it runs" />
					<ClassVenues classType={c} />
				</section>

				<section aria-labelledby="teachers">
					<SectionHead id="teachers" eyebrow="Teachers" title={`Who teaches ${c.meta?.short ?? c.title}`} link={{ href: '/instructors', label: 'All teachers' }} />
					{teachers.length ? (
						<ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
							{teachers.map((t) => (
								<li key={t.slug}>
									<InstructorCard data={t} compact />
								</li>
							))}
						</ul>
					) : (
						<EmptyState title="Teachers to be announced" />
					)}
				</section>

				<section aria-labelledby="times">
					<SectionHead id="times" eyebrow="Coming up" title="Next classes" link={{ href: filteredTimetableHref({ class: c.key }), label: 'Full timetable' }} />
					{days.length ? (
						<OccurrenceDays days={days} names={names} all={timetable} today={localParts(now).date} />
					) : (
						<EmptyState title="Nothing on the timetable right now" body="New weeks open on a rolling basis. Check the full timetable, or ask us when this class runs next." />
					)}
				</section>
			</div>
		</>
	);
}
