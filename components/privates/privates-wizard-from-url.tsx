'use client';

import { useSearchParams } from 'next/navigation';
import { resolveDeepLink, type PrivateStudioOption } from './private-model';
import { PrivatesWizard } from './privates-wizard';

/**
 * Deep links: `/privates?studio=mitte`, `?instructor=lena-hoffmann`,
 * `?format=solo|duet` (any combination) preselect and start the wizard on the
 * next unanswered step. Wrap in <Suspense>: the static page renders the plain
 * wizard first.
 */
export function PrivatesWizardFromUrl({ studios }: { studios: PrivateStudioOption[] }) {
	const params = useSearchParams();
	const link = resolveDeepLink(studios, { studio: params.get('studio'), format: params.get('format'), instructor: params.get('instructor') });
	return <PrivatesWizard key={`${link.studioId}-${link.format}-${link.instructorId}`} studios={studios} link={link} />;
}
