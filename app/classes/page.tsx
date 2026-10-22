import type { Metadata } from 'next';
import Link from 'next/link';
import { LevelPath } from '@/components/classes/level-path';
import { SpringSection } from '@/components/classes/spring-section';
import { groupBySpring } from '@/components/classes/directory';
import { EmptyState } from '@/components/classes/empty-state';
import { buttonClasses } from '@/components/ui/button';
import { PageHeading } from '@/components/ui/page-heading';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = {
	title: 'Classes',
	description: 'Reformer Foundations, Flow, Sculpt, Jump Board, Tower, Prenatal, Mat & Props and live online mat, sorted by spring.',
};
export const revalidate = 300;

export default async function ClassesPage() {
	const { classTypes } = await getCatalog();
	const groups = groupBySpring(classTypes);
	const studioNames = Object.fromEntries(
		classTypes.map((c) => [c.key, [...new Set(c.series.map((s) => s.studio?.short).filter((x): x is string => Boolean(x)))]]),
	);

	return (
		<>
			<PageHeading
				eyebrow="Classes"
				title={
					<>
						Pick your <em>springs</em>
					</>
				}
				intro="Reformer springs are colour coded by load, so we use the same colours for intensity. Green is gentle, red is heavy. Every class is capped at the beds in the room."
			/>

			<section aria-labelledby="path-title" className="container-x pb-16 lg:pb-24">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<h2 id="path-title" className="eyebrow text-graphite">
						The level path
					</h2>
					<p className="max-w-md text-sm text-graphite">Guidance, not a gate. Teachers will move you up when you&rsquo;re ready.</p>
				</div>
				<LevelPath className="mt-8" />
			</section>

			<div className="container-x space-y-16 pb-24 lg:space-y-24">
				{groups.length ? (
					groups.map((g, i) => <SpringSection key={g.spring} group={g} index={i} studioNames={studioNames} />)
				) : (
					<EmptyState title="No classes on the schedule yet" body="The class list loads from the studio's booking system. Check back soon, or write to us." />
				)}
			</div>

			<section className="border-t border-line bg-plaster-deep">
				<div className="container-x flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
					<p className="headline max-w-xl text-2xl text-ink">Want a teacher to yourself, or a deeper afternoon on one subject?</p>
					<div className="flex flex-wrap gap-3">
						<Link href="/privates" className={buttonClasses({ size: 'lg' })}>
							Book a private
						</Link>
						<Link href="/workshops" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
							See workshops
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
