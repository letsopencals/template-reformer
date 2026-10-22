import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/classes/empty-state';
import { StudioCard } from '@/components/studios/studio-card';
import { PageHeading } from '@/components/ui/page-heading';
import { physicalStudios } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const metadata: Metadata = {
	title: 'Studios',
	description: 'Tensile Mitte, Kreuzberg and Prenzlauer Berg: three small rooms of reformers in Berlin, plus live classes online.',
};
export const revalidate = 300;

export default async function StudiosPage() {
	const catalog = await getCatalog();
	const studios = physicalStudios(catalog);
	const online = catalog.studios.find((s) => s.online) ?? null;
	const onlineClass = online ? catalog.classTypes.find((c) => online.classKeys.includes(c.key)) : null;

	return (
		<>
			<PageHeading
				eyebrow="Studios"
				title={
					<>
						Three rooms <em>in Berlin</em>
					</>
				}
				intro="Every studio is small on purpose. Count the beds below: that is the most people you will ever share a class with."
			/>
			<div className="container-x space-y-16 pb-24 lg:space-y-24">
				{studios.length ? (
					studios.map((s, i) => <StudioCard key={s.id} studio={s} index={i} classCount={s.classKeys.length} />)
				) : (
					<EmptyState title="Studios are loading from the booking system" body="If this stays empty, the store has no locations yet." />
				)}

				{online ? (
					<section className="flex flex-col gap-6 rounded-[4px] border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
						<div className="max-w-xl">
							<p className="eyebrow text-steel">{online.meta?.neighbourhood ?? 'Online'}</p>
							<h2 className="display-sm mt-3 text-ink">{online.name}</h2>
							{online.meta?.blurb ? <p className="mt-3 leading-relaxed text-graphite">{online.meta.blurb}</p> : null}
						</div>
						{onlineClass ? (
							<Link
								href={`/classes/${onlineClass.key}`}
								className="eyebrow link-underline self-start text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:self-auto"
							>
								{onlineClass.title} →
							</Link>
						) : null}
					</section>
				) : null}
			</div>
		</>
	);
}
