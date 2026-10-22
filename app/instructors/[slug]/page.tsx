import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { classesTaughtBy, filteredTimetableHref, nameIndex, nextDays, pick, privatesPriceLabel } from '@/components/classes/directory';
import { EmptyState } from '@/components/classes/empty-state';
import { OccurrenceDays } from '@/components/classes/occurrence-days';
import { SectionHead } from '@/components/classes/section-head';
import { InstructorProfile } from '@/components/instructors/instructor-profile';
import { PrivatesBand } from '@/components/studios/privates-band';
import { PageHeading } from '@/components/ui/page-heading';
import { findInstructor } from '@/lib/catalog';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { localParts, upcomingFor } from '@/lib/timetable';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

/** Days with classes shown on the profile. */
const DAYS_SHOWN = 5;

export async function generateStaticParams() {
	const { instructors } = await getCatalog();
	return instructors.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const i = findInstructor(await getCatalog(), slug);
	return i ? { title: i.name, description: i.meta?.bio } : {};
}

export default async function InstructorPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [catalog, timetable] = await Promise.all([getCatalog(), getTimetable()]);
	const instructor = findInstructor(catalog, slug);
	if (!instructor) notFound();

	const now = Date.now();
	const days = nextDays(upcomingFor(timetable, { instructorId: instructor.id }), 21, now)
		.filter((d) => d.occurrences.length)
		.slice(0, DAYS_SHOWN);
	const privates = catalog.privates.flatMap((p) => p.series).filter((s) => s.instructors.some((t) => t.id === instructor.id));
	const profile = {
		name: instructor.name,
		image: instructor.image,
		bio: instructor.meta?.bio ?? null,
		story: instructor.meta?.story ?? null,
		languages: instructor.meta?.languages ?? [],
		specialities: instructor.meta?.specialities ?? [],
		instagram: instructor.meta?.instagram ?? null,
		studios: pick(catalog.studios, instructor.studioIds).map((s) => ({ key: s.key, short: s.short })),
		classes: classesTaughtBy(instructor, catalog.classTypes).map((c) => ({ key: c.key, short: c.meta?.short ?? c.title, spring: c.spring })),
	};

	return (
		<>
			<PageHeading eyebrow="Instructors" title={instructor.name} />
			<div className="container-x space-y-20 pb-24 lg:space-y-28">
				<InstructorProfile data={profile} />

				<section aria-labelledby="times">
					<SectionHead
						id="times"
						eyebrow="Coming up"
						title={`Classes with ${instructor.firstName}`}
						link={{ href: filteredTimetableHref({ instructor: instructor.slug }), label: 'Full timetable' }}
					/>
					{days.length ? (
						<OccurrenceDays days={days} names={nameIndex(catalog.studios, catalog.instructors)} all={timetable} today={localParts(now).date} />
					) : (
						<EmptyState title={`No classes with ${instructor.firstName} on the timetable`} body="Their next weeks may not be published yet. A private session is the surest way in." />
					)}
				</section>

				<PrivatesBand
					title={`Book a private with ${instructor.firstName}`}
					body={`An hour on the reformer with ${instructor.firstName}: a first session, an injury, a goal. On your own or as a duet.`}
					href={`/privates?instructor=${encodeURIComponent(instructor.slug)}`}
					price={privatesPriceLabel(privates)}
				/>
			</div>
		</>
	);
}
