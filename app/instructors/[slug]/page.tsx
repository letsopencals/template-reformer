import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StubPage } from '@/components/layout/stub-page';
import { findInstructor } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	const { instructors } = await getCatalog();
	return instructors.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const i = findInstructor(await getCatalog(), slug);
	return i ? { title: i.name, description: i.meta?.bio } : {};
}

// TODO(P4 instructors): profile with bio, languages, specialities and upcoming classes.
export default async function InstructorPage({ params }: { params: Params }) {
	const { slug } = await params;
	const instructor = findInstructor(await getCatalog(), slug);
	if (!instructor) notFound();
	return <StubPage eyebrow="Instructor" title={instructor.name} intro={instructor.meta?.story ?? instructor.meta?.bio} owner="P4 classes/studios/instructors" />;
}
