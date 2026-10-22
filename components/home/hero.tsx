import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { HeroMedia } from '@/components/home/hero-media';
import { siteConfig } from '@/lib/site-config';

export interface HeroStat {
	value: number;
	label: string;
}

const RISE = 'motion-safe:animate-[fade-up_0.9s_var(--ease-settle)_both]';

/**
 * Cinematic hero: the studio film in an inset frame (the fixed header sits on
 * plaster above it), an oversized expanded headline with its light
 * counterweight, two ways in, and the counts the API gives us.
 */
export function Hero({ studios, stats, firstTimeHref }: { studios: string[]; stats: HeroStat[]; firstTimeHref: string }) {
	const [strong, ...rest] = siteConfig.tagline.split(', ');
	const counter = rest.join(', ');
	return (
		<section aria-labelledby="hero-title" className="px-2 pt-16 sm:px-3 lg:pt-[72px]">
			<div className="relative isolate flex h-[calc(100svh-4.75rem)] min-h-[600px] max-h-[1000px] flex-col overflow-hidden rounded-[4px] bg-ink text-paper lg:h-[calc(100svh-5.5rem)]">
				<HeroMedia />
				<div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.45)_0%,rgba(18,18,18,0)_28%,rgba(18,18,18,0.1)_55%,rgba(18,18,18,0.78)_100%)]" />

				<div className="container-x relative flex items-start justify-between gap-6 pt-6 lg:pt-8">
					<p className={`eyebrow text-paper/80 ${RISE}`}>Reformer Pilates · Berlin</p>
					{studios.length ? (
						<ul className={`eyebrow flex flex-wrap justify-end gap-x-4 gap-y-1 text-paper/70 max-sm:hidden ${RISE} [animation-delay:120ms]`}>
							{studios.map((s) => (
								<li key={s} className="flex items-center gap-2">
									<span aria-hidden className="h-1 w-1 bg-paper/60" />
									{s}
								</li>
							))}
						</ul>
					) : null}
				</div>

				<div className="container-x relative mt-auto pb-8 lg:pb-12">
					<h1 id="hero-title" className="display-xl text-[clamp(2.4rem,10.5vw,10rem)] text-paper">
						<span className={`block ${RISE} [animation-delay:150ms]`}>{strong}{counter ? ',' : ''}</span>
						{counter ? <em className={`block ${RISE} [animation-delay:300ms]`}>{counter}</em> : null}
					</h1>

					<span aria-hidden className="mt-8 block h-px w-full origin-left bg-paper/30 motion-safe:animate-[cable-draw_1.4s_var(--ease-settle)_0.5s_both]" />

					<div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
						<div className={`${RISE} [animation-delay:450ms]`}>
							<p className="max-w-md text-[1.02rem] leading-relaxed text-paper/80">{siteConfig.description}</p>
							<div className="mt-7 flex flex-wrap items-center gap-3">
								<MagneticButton strength={0.2}>
									<Link href="/timetable" className={buttonClasses({ variant: 'inverse', size: 'lg' })}>
										Book a class
										<span aria-hidden>→</span>
									</Link>
								</MagneticButton>
								<Link
									href={firstTimeHref}
									className="inline-flex h-14 items-center justify-center gap-2 rounded-[2px] border border-paper/45 px-7 font-semibold max-sm:w-full max-sm:px-4 max-sm:text-[0.95rem] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
								>
									First time? Start with Foundations
								</Link>
							</div>
						</div>
						{stats.length ? <HeroStats stats={stats} /> : null}
					</div>
				</div>
			</div>
		</section>
	);
}

function HeroStats({ stats }: { stats: HeroStat[] }) {
	return (
		<dl className={`grid grid-cols-3 gap-6 border-t border-paper/20 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 ${RISE} [animation-delay:600ms]`}>
			{stats.map((s) => (
				<div key={s.label}>
					<dt className="eyebrow text-paper/55">{s.label}</dt>
					<dd className="tabular mt-1.5 text-3xl font-medium text-paper lg:text-4xl">{String(s.value).padStart(2, '0')}</dd>
				</div>
			))}
		</dl>
	);
}
