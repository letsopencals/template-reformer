import type { Metadata } from 'next';
import Link from 'next/link';
import { StubPage } from '@/components/layout/stub-page';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Instructors', description: 'Eight teachers across three Berlin studios.' };
export const revalidate = 300;

// TODO(P4 instructors): instructor grid with portraits, studios and classes.
export default async function InstructorsPage() {
	const { instructors } = await getCatalog();
	return (
		<StubPage eyebrow="Instructors" title="Eight teachers" owner="P4 classes/studios/instructors">
			<ul className="divide-y divide-line border-y border-line">
				{instructors.map((i) => (
					<li key={i.id} className="py-4">
						<Link href={`/instructors/${i.slug}`} className="headline text-xl">
							{i.name}
						</Link>
						<p className="mt-1 text-sm text-graphite">{i.meta?.bio}</p>
					</li>
				))}
			</ul>
		</StubPage>
	);
}
