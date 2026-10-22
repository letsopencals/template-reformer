import Link from 'next/link';
import { SpringChip } from '@/components/motifs/spring-chip';
import { buttonClasses } from '@/components/ui/button';
import type { ClassType } from '@/lib/catalog';
import { formatWholePrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { filteredTimetableHref, minutes } from './directory';

/** The numbers under a class title: spring, duration, price, beds, studios; plus the timetable CTA. */
export function ClassFacts({ classType: c }: { classType: ClassType }) {
	const prices = [...new Set(c.series.map((s) => s.price))];
	const beds = [...new Set(c.series.map((s) => s.capacity))].sort((a, b) => a - b);
	const studios = new Set(c.series.map((s) => s.studio?.id).filter(Boolean)).size;
	const facts = [
		{ label: 'Length', value: c.duration ? minutes(c.duration) : '—' },
		{ label: 'Price', value: `${prices.length > 1 ? 'from ' : ''}${formatWholePrice(c.fromPrice, siteConfig.currency)}` },
		{ label: c.kind === 'online' ? 'Places' : 'Beds', value: beds.length ? (beds.length > 1 ? `${beds[0]}–${beds[beds.length - 1]}` : String(beds[0])) : '—' },
		c.kind === 'online' ? { label: 'Where', value: 'Online' } : { label: 'Studios', value: studios ? String(studios) : '—' },
	];
	return (
		<div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
			<dl className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-5">
				<div>
					<dt className="eyebrow text-steel">Spring</dt>
					<dd className="mt-2">
						<SpringChip spring={c.spring} />
					</dd>
				</div>
				{facts.map((f) => (
					<div key={f.label}>
						<dt className="eyebrow text-steel">{f.label}</dt>
						<dd className="tabular mt-1.5 text-xl text-ink">{f.value}</dd>
					</div>
				))}
			</dl>
			<Link href={filteredTimetableHref({ class: c.key })} className={buttonClasses({ size: 'lg', className: 'self-start lg:self-auto' })}>
				See all times
			</Link>
		</div>
	);
}
