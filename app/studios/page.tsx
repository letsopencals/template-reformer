import type { Metadata } from 'next';
import Link from 'next/link';
import { StubPage } from '@/components/layout/stub-page';
import { physicalStudios } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Studios', description: 'Tensile Mitte, Kreuzberg and Prenzlauer Berg.' };
export const revalidate = 300;

// TODO(P4 studios): studio index (or redirect to the first studio).
export default async function StudiosPage() {
	const studios = physicalStudios(await getCatalog());
	return (
		<StubPage eyebrow="Studios" title="Three rooms in Berlin" owner="P4 classes/studios/instructors">
			<ul className="divide-y divide-line border-y border-line">
				{studios.map((s) => (
					<li key={s.id} className="py-4">
						<Link href={`/studios/${s.key}`} className="headline text-xl">
							{s.name}
						</Link>
						<p className="tabular mt-1 text-sm text-graphite">{s.address}</p>
					</li>
				))}
			</ul>
		</StubPage>
	);
}
