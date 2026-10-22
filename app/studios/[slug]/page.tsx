import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { filteredTimetableHref, instructorCardData, nameIndex, nextDays, pick, privatesPriceLabel } from '@/components/classes/directory';
import { EmptyState } from '@/components/classes/empty-state';
import { OccurrenceDays } from '@/components/classes/occurrence-days';
import { SectionHead } from '@/components/classes/section-head';
import { InstructorCard } from '@/components/instructors/instructor-card';
import { PrivatesBand } from '@/components/studios/privates-band';
import { StudioPhotos } from '@/components/studios/studio-photos';
import { StudioRooms } from '@/components/studios/studio-rooms';
import { StudioVisit } from '@/components/studios/studio-visit';
import { PageHeading } from '@/components/ui/page-heading';
import { findStudio, physicalStudios } from '@/lib/catalog';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { localParts, upcomingFor } from '@/lib/timetable';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	return physicalStudios(await getCatalog()).map((s) => ({ slug: s.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const s = findStudio(await getCatalog(), slug);
	return s && !s.online ? { title: s.name, description: s.meta?.blurb ?? s.address } : {};
}

export default async function StudioPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [catalog, timetable] = await Promise.all([getCatalog(), getTimetable()]);
	const studio = findStudio(catalog, slug);
	// The online "studio" has no rooms or address; its classes live on /classes.
	if (!studio || studio.online) notFound();

	const now = Date.now();
	const week = nextDays(upcomingFor(timetable, { studioId: studio.id }), 7, now);
	const hasClasses = week.some((d) => d.occurrences.length);
	const teachers = pick(catalog.instructors, studio.instructorIds).map((i) => instructorCardData(i, catalog));
	const privates = catalog.privates.flatMap((p) => p.series).filter((s) => s.studio?.id === studio.id);
	const names = nameIndex(catalog.studios, catalog.instructors);

	return (
		<>
			<PageHeading eyebrow={`Studios · ${studio.meta?.neighbourhood ?? studio.short}`} title={studio.name} intro={studio.meta?.blurb} />

			<div className="container-x space-y-20 pb-24 lg:space-y-28">
				<StudioPhotos images={studio.meta?.images ?? []} name={studio.name} />

				<section aria-label="Visiting" className="md:pt-6">
					<StudioVisit studio={studio} />
				</section>

				{studio.meta?.rooms.length ? (
					<section aria-labelledby="rooms">
						<SectionHead id="rooms" eyebrow="Rooms" title="The floor plan" />
						<StudioRooms rooms={studio.meta.rooms} studioKey={studio.key} classTypes={catalog.classTypes} />
					</section>
				) : null}

				<section aria-labelledby="week">
					<SectionHead
						id="week"
						eyebrow="Next 7 days"
						title={`This week in ${studio.short}`}
						link={{ href: filteredTimetableHref({ studio: studio.key }), label: 'Full timetable' }}
					/>
					{hasClasses ? (
						<OccurrenceDays days={week} names={names} all={timetable} today={localParts(now).date} />
					) : (
						<EmptyState title="No classes in the next 7 days" body="The timetable may not be published yet. Try the full timetable or another studio." />
					)}
				</section>

				<section aria-labelledby="teachers">
					<SectionHead id="teachers" eyebrow="Teachers" title={`Who teaches in ${studio.short}`} link={{ href: '/instructors', label: 'All teachers' }} />
					{teachers.length ? (
						<ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
							{teachers.map((t) => (
								<li key={t.slug}>
									<InstructorCard data={t} />
								</li>
							))}
						</ul>
					) : (
						<EmptyState title="Teachers to be announced" />
					)}
				</section>

				<PrivatesBand
					title={`A private in ${studio.short}`}
					body={`One teacher, one reformer, in the private room at ${studio.name}. Bring a friend for a duet.`}
					href={`/privates?studio=${encodeURIComponent(studio.key)}`}
					price={privatesPriceLabel(privates)}
				/>
			</div>
		</>
	);
}
