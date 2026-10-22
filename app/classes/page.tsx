import type { Metadata } from 'next';
import Link from 'next/link';
import { StubPage } from '@/components/layout/stub-page';
import { SpringChip } from '@/components/motifs/spring-chip';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Classes', description: 'Reformer Foundations, Flow, Sculpt, Jump Board, Tower, Prenatal, Mat & Props and live online mat.' };
export const revalidate = 300;

// TODO(P4 classes): class types along the level path with spring intensity.
export default async function ClassesPage() {
	const { classTypes } = await getCatalog();
	return (
		<StubPage eyebrow="Classes" title="Eight ways onto the springs" owner="P4 classes/studios/instructors">
			<ul className="divide-y divide-line border-y border-line">
				{classTypes.map((c) => (
					<li key={c.key} className="flex items-center justify-between gap-4 py-4">
						<Link href={`/classes/${c.key}`} className="headline text-xl">
							{c.title}
						</Link>
						<SpringChip spring={c.spring} text={c.level} />
					</li>
				))}
			</ul>
		</StubPage>
	);
}
