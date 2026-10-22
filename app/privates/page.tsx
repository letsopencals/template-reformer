import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeading } from '@/components/ui/page-heading';
import { PrivatesWizard } from '@/components/privates/privates-wizard';
import { PrivatesWizardFromUrl } from '@/components/privates/privates-wizard-from-url';
import { PrivatesUses } from '@/components/privates/privates-uses';
import { PrivatesEmpty } from '@/components/privates/privates-empty';
import { buildPrivateStudios } from '@/components/privates/private-model';
import { getCatalog } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = { title: 'Private sessions', description: siteConfig.privates.tagline };
export const revalidate = 300;

export default async function PrivatesPage() {
	const studios = buildPrivateStudios(await getCatalog());
	return (
		<>
			<PageHeading
				eyebrow="Privates · 1:1 and Duet"
				title={
					<>
						One teacher, <em>one room</em>
					</>
				}
				intro={siteConfig.privates.tagline}
			/>
			<div className="container-x">
				{studios.length ? (
					<Suspense fallback={<PrivatesWizard studios={studios} />}>
						<PrivatesWizardFromUrl studios={studios} />
					</Suspense>
				) : (
					<PrivatesEmpty />
				)}
			</div>
			<PrivatesUses />
		</>
	);
}
