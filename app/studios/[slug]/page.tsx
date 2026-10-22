import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StubPage } from '@/components/layout/stub-page';
import { RoomPlan } from '@/components/motifs/room-plan';
import { findStudio, physicalStudios } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	return physicalStudios(await getCatalog()).map((s) => ({ slug: s.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const s = findStudio(await getCatalog(), slug);
	return s ? { title: s.name, description: s.meta?.blurb ?? s.address } : {};
}

// TODO(P4 studios): studio page: photos, room plans, address/transit, its own timetable.
export default async function StudioPage({ params }: { params: Params }) {
	const { slug } = await params;
	const studio = findStudio(await getCatalog(), slug);
	if (!studio) notFound();
	return (
		<StubPage eyebrow={studio.address} title={studio.name} intro={studio.meta?.blurb} owner="P4 classes/studios/instructors">
			<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{(studio.meta?.rooms ?? []).map((r) => (
					<RoomPlan key={r.key} room={r} />
				))}
			</div>
		</StubPage>
	);
}
