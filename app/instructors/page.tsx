import type { Metadata } from 'next';
import { instructorCardData } from '@/components/classes/directory';
import { EmptyState } from '@/components/classes/empty-state';
import { InstructorCard } from '@/components/instructors/instructor-card';
import { Reveal } from '@/components/motion/reveal';
import { PageHeading } from '@/components/ui/page-heading';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = {
	title: 'Instructors',
	description: 'The teachers at Tensile: languages, specialities, the studios they teach in and the classes they take.',
};
export const revalidate = 300;

export default async function InstructorsPage() {
	const catalog = await getCatalog();
	const cards = catalog.instructors.map((i) => instructorCardData(i, catalog));
	const languages = [...new Set(cards.flatMap((c) => c.languages))];

	return (
		<>
			<PageHeading
				eyebrow="Instructors"
				title={
					<>
						The people <em>on the footbar</em>
					</>
				}
				intro="Dancers, a rower, a physio, a sprinter. They teach small rooms only, so they see every rep and know your name by the second class."
			>
				{cards.length ? (
					<p className="tabular mt-6 text-sm text-graphite">
						{cards.length} {cards.length === 1 ? 'teacher' : 'teachers'}{languages.length ? ` · classes in ${languages.join(', ')}` : ''}
					</p>
				) : null}
			</PageHeading>
			<div className="container-x pb-24">
				{cards.length ? (
					<ul className="grid grid-cols-1 gap-x-6 gap-y-14 min-[420px]:grid-cols-2 lg:grid-cols-4">
						{cards.map((c, i) => (
							<Reveal as="li" key={c.slug} delay={(i % 4) * 0.06}>
								<InstructorCard data={c} />
							</Reveal>
						))}
					</ul>
				) : (
					<EmptyState title="Teachers will appear here" body="Instructors load from the studio's booking system." />
				)}
			</div>
		</>
	);
}
