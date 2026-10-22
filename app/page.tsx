import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { StubPage } from '@/components/layout/stub-page';
import { SpringChip } from '@/components/motifs/spring-chip';
import { siteConfig } from '@/lib/site-config';
import { getCatalog } from '@/lib/server-data';

export const revalidate = 300;

// TODO(P1 home): hero video, "Today at Tensile" board, class types, studios,
// instructors, intro offer, first class, FAQ.
export default async function HomePage() {
	const catalog = await getCatalog();
	return (
		<StubPage eyebrow="Reformer Pilates · Berlin" title={siteConfig.tagline} intro={siteConfig.description} owner="P1 home">
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{catalog.classTypes.map((c) => (
					<li key={c.key} className="border border-line bg-paper p-4">
						<SpringChip spring={c.spring} text={c.level} />
						<Link href={`/classes/${c.key}`} className="headline mt-3 block text-lg">
							{c.title}
						</Link>
					</li>
				))}
			</ul>
			<Link href="/timetable" className={buttonClasses({ size: 'lg', className: 'mt-10' })}>
				Book a class
			</Link>
		</StubPage>
	);
}
