import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeading } from '@/components/ui/page-heading';
import { buttonClasses } from '@/components/ui/button';
import { WorkshopEntry } from '@/components/workshops/workshop-entry';
import { buildWorkshopListings } from '@/components/workshops/workshop-model';
import { getCatalog, getWorkshopOccurrences } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = { title: 'Workshops', description: 'Two-hour workshops on reformer anatomy, running and teaching.' };
export const revalidate = 300;

export default async function WorkshopsPage() {
	const [catalog, occurrences] = await Promise.all([getCatalog(), getWorkshopOccurrences()]);
	const workshops = buildWorkshopListings(catalog, occurrences);
	return (
		<>
			<PageHeading
				eyebrow="Workshops · Saturdays"
				title={
					<>
						Two hours, <em>one subject</em>
					</>
				}
				intro={siteConfig.workshopsPage.intro}
			/>
			<div className="container-x pb-24">
				{workshops.length ? (
					workshops.map((w, i) => <WorkshopEntry key={w.key} workshop={w} index={i} />)
				) : (
					<div className="rounded-[4px] border border-line bg-paper p-8 sm:p-12">
						<p className="display-sm max-w-xl text-ink">{siteConfig.workshopsPage.empty}</p>
						<Link href="/timetable" className={buttonClasses({ variant: 'outline', className: 'mt-8' })}>
							See the timetable
						</Link>
					</div>
				)}
				<span aria-hidden className="cable" />
			</div>
		</>
	);
}
