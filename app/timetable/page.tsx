import type { Metadata } from 'next';
import { StubPage } from '@/components/layout/stub-page';
import { BedPips } from '@/components/motifs/bed-pips';
import { getTimetable } from '@/lib/server-data';

export const metadata: Metadata = { title: 'Timetable', description: 'Every reformer class at Tensile Mitte, Kreuzberg and Prenzlauer Berg, with beds left.' };
export const revalidate = 300;

// TODO(P2 timetable): week poster board (desktop) / swipeable days (mobile), URL-param
// filters (studio, class, level, instructor, time), bed pips, Full + "next with space →",
// off-peak tags, and the class sheet that turns into checkout.
export default async function TimetablePage() {
	const occurrences = await getTimetable();
	return (
		<StubPage eyebrow="Timetable" title="This week" owner="P2 timetable + class sheet + checkout">
			<ul className="divide-y divide-line border-y border-line">
				{occurrences.slice(0, 20).map((o) => (
					<li key={o.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
						<span className="tabular text-sm">
							{o.localDate} {o.localTime}
						</span>
						<span className="flex-1">{o.title}</span>
						<span className="text-sm text-graphite">{o.variantTitle}</span>
						<BedPips capacity={o.capacity} seatsLeft={o.seatsLeft} />
					</li>
				))}
			</ul>
		</StubPage>
	);
}
