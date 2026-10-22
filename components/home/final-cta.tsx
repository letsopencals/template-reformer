import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { Reveal } from '@/components/motion/reveal';
import { TensionCable } from '@/components/motifs/tension-cable';
import { siteConfig } from '@/lib/site-config';

/** Closing call to action, on plaster above the ink footer. */
export function FinalCta() {
	return (
		<section aria-labelledby="cta-title" className="container-x pt-8 pb-24 lg:pb-32">
			<TensionCable sag={18} className="h-5!" />
			<Reveal className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:items-end">
				<h2 id="cta-title" className="display-xl text-[clamp(2.75rem,9vw,8rem)] text-ink lg:col-span-8">
					Hold <em>your bed.</em>
				</h2>
				<div className="lg:col-span-4">
					<p className="leading-relaxed text-graphite">
						Classes open {siteConfig.policies.bookingWindowDays} days ahead and the good evening slots go first. Prefer a teacher to yourself? Book a private.
					</p>
					<div className="mt-7 flex flex-wrap items-center gap-3">
						<MagneticButton strength={0.2}>
							<Link href="/timetable" className={buttonClasses({ size: 'lg' })}>
								Book a class <span aria-hidden>→</span>
							</Link>
						</MagneticButton>
						<Link href="/privates" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
							Privates
						</Link>
					</div>
				</div>
			</Reveal>
		</section>
	);
}
