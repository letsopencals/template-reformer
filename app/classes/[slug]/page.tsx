import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StubPage } from '@/components/layout/stub-page';
import { RoomPlan } from '@/components/motifs/room-plan';
import { findClassType } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	const { classTypes } = await getCatalog();
	return classTypes.map((c) => ({ slug: c.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const c = findClassType(await getCatalog(), slug);
	return c ? { title: c.title, description: c.meta?.tagline ?? c.description } : {};
}

// TODO(P4 classes): class type page: spring level, what to bring, prerequisite,
// level path, rooms, instructors, upcoming occurrences.
export default async function ClassPage({ params }: { params: Params }) {
	const { slug } = await params;
	const c = findClassType(await getCatalog(), slug);
	if (!c) notFound();
	const room = c.series.find((s) => s.room)?.room ?? null;
	return (
		<StubPage eyebrow={c.level} title={c.title} intro={c.meta?.tagline ?? c.description} owner="P4 classes/studios/instructors">
			{room ? (
				<div className="max-w-md">
					<RoomPlan room={room} />
				</div>
			) : null}
		</StubPage>
	);
}
