import { Reveal } from '@/components/motion/reveal';
import { TensionCable } from '@/components/motifs/tension-cable';
import { siteConfig } from '@/lib/site-config';

/** What a private is for: four short reasons on a tension-cable grid. */
export function PrivatesUses() {
	const uses = siteConfig.privates.uses;
	return (
		<section aria-labelledby="privates-uses" className="container-x section-y">
			<div className="grid gap-10 lg:grid-cols-12">
				<div className="lg:col-span-4">
					<p className="eyebrow text-steel">Why a private</p>
					<h2 id="privates-uses" className="display-md mt-4 text-ink">
						Your hour, <em>your springs</em>
					</h2>
				</div>
				<ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8" role="list">
					{uses.map((u, i) => (
						<Reveal as="li" key={u.title} delay={i * 0.06}>
							<TensionCable sag={4} delay={i * 0.08} />
							<p className="tabular mt-5 text-sm text-steel">{String(i + 1).padStart(2, '0')}</p>
							<h3 className="headline mt-2 text-xl text-ink">{u.title}</h3>
							<p className="mt-2 leading-relaxed text-graphite">{u.body}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
