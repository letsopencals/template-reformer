import type { Studio } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { mapsHref } from '@/components/classes/directory';
import { Reveal } from '@/components/motion/reveal';

/**
 * Getting there and what's inside: address with a Google Maps link (a search
 * URL, no API key), transit, opening hours, amenities and the front desk.
 */
export function StudioVisit({ studio }: { studio: Studio }) {
	const amenities = studio.meta?.amenities ?? [];
	return (
		<div className="grid gap-10 md:grid-cols-3">
			<Reveal>
				<h3 className="eyebrow text-graphite">Address</h3>
				<address className="tabular mt-3 text-[0.95rem] leading-relaxed text-ink not-italic">
					{studio.address.split(', ').map((line) => (
						<span key={line} className="block">
							{line}
						</span>
					))}
				</address>
				<a
					href={mapsHref(studio)}
					target="_blank"
					rel="noopener noreferrer"
					className="eyebrow link-underline mt-4 inline-block text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
				>
					Open in Google Maps ↗<span className="sr-only"> (opens in a new tab)</span>
				</a>
			</Reveal>
			<Reveal delay={0.05}>
				<h3 className="eyebrow text-graphite">Getting here</h3>
				<p className="tabular mt-3 text-[0.95rem] text-ink">{studio.meta?.transit ?? 'Ask us for directions.'}</p>
				<h3 className="eyebrow mt-6 text-graphite">Hours</h3>
				<p className="tabular mt-3 text-[0.95rem] text-ink">{siteConfig.contact.hours}</p>
			</Reveal>
			<Reveal delay={0.1}>
				<h3 className="eyebrow text-graphite">In the building</h3>
				{amenities.length ? (
					<ul className="mt-3 space-y-1.5">
						{amenities.map((a) => (
							<li key={a} className="flex items-baseline gap-3 text-[0.95rem] text-ink">
								<span aria-hidden className="h-px w-3 shrink-0 translate-y-[-3px] bg-ink/40" />
								{a}
							</li>
						))}
					</ul>
				) : (
					<p className="mt-3 text-[0.95rem] text-graphite">Ask the front desk.</p>
				)}
				<p className="tabular mt-6 text-sm text-graphite">
					<a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="link-underline text-ink focus-visible:outline-2 focus-visible:outline-ink">
						{siteConfig.contact.phone}
					</a>
				</p>
			</Reveal>
		</div>
	);
}
