'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import type { Occurrence } from '@/lib/timetable';
import { formatWholePrice } from '@/lib/format';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/components/privates/use-add-to-cart';
import { siteConfig } from '@/lib/site-config';
import { CapacityBar } from './capacity-bar';
import { dateBlock, workshopBookingBody } from './workshop-model';

/** Price, beds left for the picked date, the date chips and "Hold your bed". */
export function WorkshopBooking({ title, price, dates }: { title: string; price: number; dates: Occurrence[] }) {
	const { currency } = useSettings();
	const [selectedKey, setSelectedKey] = useState(dates[0]?.key ?? null);
	const { book, pending, error } = useAddToCart();
	const occ = dates.find((d) => d.key === selectedKey) ?? dates[0] ?? null;
	if (!occ) return null;
	const low = occ.seatsLeft <= siteConfig.lowSeatsThreshold;

	return (
		<div className="rounded-[4px] border border-line bg-paper p-6">
			<div className="flex items-baseline justify-between">
				<span className="eyebrow text-steel">Per person</span>
				<span className="display-sm tabular text-ink">{formatWholePrice(price, currency)}</span>
			</div>
			{dates.length > 1 ? (
				<ul className="mt-5 flex flex-wrap gap-1.5" role="list" aria-label={`${title}: pick a date`}>
					{dates.map((d) => {
						const b = dateBlock(d);
						return (
							<li key={d.key}>
								<button
									type="button"
									aria-pressed={d.key === occ.key}
									onClick={() => setSelectedKey(d.key)}
									className={clsx(
										'tabular h-9 rounded-[2px] border px-3 text-[0.8rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
										d.key === occ.key ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink',
									)}
								>
									{b.weekday} {b.day} {b.month}
								</button>
							</li>
						);
					})}
				</ul>
			) : null}
			<CapacityBar className="mt-6" capacity={occ.capacity} seatsLeft={occ.seatsLeft} />
			<Button variant={low ? 'urgent' : 'primary'} size="lg" fullWidth className="mt-6" disabled={pending} aria-busy={pending} onClick={() => void book(workshopBookingBody(occ))}>
				{pending ? 'Holding your bed…' : 'Hold your bed'}
			</Button>
			{error ? (
				<p role="alert" className="mt-3 text-sm text-spring-red">
					{error}
				</p>
			) : null}
		</div>
	);
}
