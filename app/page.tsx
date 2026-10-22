import { Suspense } from 'react';
import { Hero, type HeroStat } from '@/components/home/hero';
import { LiveBoard } from '@/components/home/live-board';
import { LiveBoardSkeleton } from '@/components/home/board-frame';
import { SpringSystem } from '@/components/home/spring-system';
import { ClassTypes } from '@/components/home/class-types';
import { LevelPathSection } from '@/components/home/level-path-section';
import { Studios } from '@/components/home/studios';
import { InstructorsStrip } from '@/components/home/instructors-strip';
import { IntroOffer } from '@/components/home/intro-offer';
import { FirstClass } from '@/components/home/first-class';
import { EditorialBand } from '@/components/home/editorial-band';
import { Faq } from '@/components/home/faq';
import { FinalCta } from '@/components/home/final-cta';
import { findClassType, physicalStudios } from '@/lib/catalog';
import { storeContact } from '@/lib/contact';
import { getCatalog, getStoreSettings } from '@/lib/server-data';
import { roomFor, siteConfig } from '@/lib/site-config';

export const revalidate = 300;

const STARTER = 'foundations';

export default async function HomePage() {
	const [catalog, settings] = await Promise.all([getCatalog(), getStoreSettings()]);
	const studios = physicalStudios(catalog);
	const online = catalog.studios.find((s) => s.online) ?? null;
	const starterKey = findClassType(catalog, STARTER) ? STARTER : (catalog.starterKeys[0] ?? null);
	const starterHref = starterKey ? `/classes/${starterKey}` : '/classes';
	const starterRoom = studios.map((s) => roomFor(STARTER, s.slug)).find((r) => r !== null) ?? null;

	// Real counts only; a zero hides its stat.
	const stats: HeroStat[] = [
		{ value: studios.length, label: studios.length === 1 ? 'Studio' : 'Studios' },
		{ value: catalog.instructors.length, label: 'Teachers' },
		{ value: catalog.classTypes.length, label: 'Classes' },
	].filter((s) => s.value > 0);

	return (
		<>
			<Hero studios={studios.map((s) => s.short)} stats={stats} firstTimeHref={starterHref} />
			<Suspense fallback={<LiveBoardSkeleton />}>
				<LiveBoard />
			</Suspense>
			<SpringSystem catalog={catalog} />
			<ClassTypes classTypes={catalog.classTypes} currency={settings?.currency ?? siteConfig.currency} />
			<LevelPathSection classKeys={catalog.classTypes.map((c) => c.key)} />
			<Studios studios={studios} online={online} />
			<InstructorsStrip instructors={catalog.instructors} />
			<IntroOffer starterHref={starterHref} room={starterRoom} />
			<FirstClass />
			<EditorialBand />
			<Faq email={storeContact(settings).email} />
			<FinalCta />
		</>
	);
}
