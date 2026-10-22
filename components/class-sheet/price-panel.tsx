import { pricePreview } from '@/lib/class-sheet';
import { siteConfig } from '@/lib/site-config';
import type { Occurrence } from '@/lib/timetable';
import { money } from '@/components/timetable/labels';

/** Price, extras and what the automatic offers would make it. The cart is the truth. */
export function PricePanel({ occurrence: o, addOnsTotal }: { occurrence: Occurrence; addOnsTotal: number }) {
	const p = pricePreview(o);
	return (
		<section className="mt-8 border-t border-line pt-6" aria-label="Price">
			<dl className="space-y-2 text-sm">
				<div className="flex items-baseline justify-between gap-4">
					<dt className="text-graphite">Class</dt>
					<dd className="tabular text-ink">{money(p.base)}</dd>
				</div>
				{addOnsTotal > 0 ? (
					<div className="flex items-baseline justify-between gap-4">
						<dt className="text-graphite">Extras</dt>
						<dd className="tabular text-ink">{money(addOnsTotal)}</dd>
					</div>
				) : null}
			</dl>
			{p.offPeak !== null || p.intro !== null ? (
				<ul className="mt-4 space-y-2 border-l border-concrete pl-3 text-xs leading-relaxed text-graphite">
					{p.offPeak !== null ? (
						<li>
							<span className="eyebrow mr-1.5 text-ink">{siteConfig.offPeak.label}</span>
							This one starts in the midday window: <span className="tabular text-ink">{money(p.offPeak)}</span>.
						</li>
					) : null}
					{p.intro !== null ? (
						<li>
							<span className="eyebrow mr-1.5 text-ink">First time?</span>
							Your first order is {siteConfig.introOffer.percent}% off: <span className="tabular text-ink">{money(p.intro)}</span>.
						</li>
					) : null}
					<li className="text-steel">Offers don&rsquo;t stack. The best one is applied at checkout, automatically.</li>
				</ul>
			) : null}
		</section>
	);
}
