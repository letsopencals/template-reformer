import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeading } from '@/components/ui/page-heading';
import { TimetableView } from '@/components/timetable/timetable-view';
import { TimetableFallback } from '@/components/timetable/timetable-fallback';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { buildTimetableLookup } from '@/lib/timetable-lookup';
import { localParts } from '@/lib/timetable';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
	title: 'Timetable',
	description: 'Every reformer class at Tensile Mitte, Kreuzberg and Prenzlauer Berg, and live online, with the beds left in each.',
};
export const revalidate = 300;

export default async function TimetablePage() {
	const [occurrences, catalog] = await Promise.all([getTimetable(), getCatalog()]);
	const lookup = buildTimetableLookup(catalog);
	const today = localParts(Date.now()).date;

	return (
		<>
			<PageHeading
				eyebrow={`Timetable · ${siteConfig.policies.bookingWindowDays} days ahead`}
				title={
					<>
						The week at <em>Tensile</em>
					</>
				}
				intro="Every class in Mitte, Kreuzberg, Prenzlauer Berg and online. Each pip is a bed; beds refresh every few minutes."
			/>
			<div className="container-x pb-24 lg:pb-32">
				<Suspense fallback={<TimetableFallback occurrences={occurrences} />}>
					<TimetableView occurrences={occurrences} lookup={lookup} today={today} />
				</Suspense>
			</div>
		</>
	);
}
