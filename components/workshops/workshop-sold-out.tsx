import { Tag } from '@/components/ui/chip';
import { siteConfig } from '@/lib/site-config';

/** No open date left: say so, and how to hear about the next one. */
export function WorkshopSoldOut({ title }: { title: string }) {
	const copy = siteConfig.workshopsPage;
	return (
		<div className="rounded-[4px] border border-dashed border-concrete p-6">
			<Tag tone="red">{copy.soldOut}</Tag>
			<p className="mt-4 text-sm leading-relaxed text-graphite">{copy.joinNext}</p>
			<a
				href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(`Next date: ${title}`)}`}
				className="link-underline mt-4 inline-block text-sm font-semibold text-ink"
			>
				{siteConfig.contact.email}
			</a>
		</div>
	);
}
