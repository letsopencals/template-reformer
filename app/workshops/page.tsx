import type { Metadata } from 'next';
import { StubPage } from '@/components/layout/stub-page';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Workshops', description: 'Two-hour workshops on reformer anatomy, running and teaching.' };
export const revalidate = 300;

// TODO(P3 workshops): dated workshop listings; full workshops simply disappear.
export default async function WorkshopsPage() {
	const { workshops } = await getCatalog();
	return (
		<StubPage eyebrow="Workshops" title="Workshops" owner="P3 privates/workshops">
			<ul className="divide-y divide-line border-y border-line">
				{workshops.map((w) => (
					<li key={w.key} className="py-4">
						<p className="headline text-xl">{w.title}</p>
						<p className="mt-1 text-sm text-graphite">{w.workshopMeta?.tagline}</p>
					</li>
				))}
			</ul>
		</StubPage>
	);
}
