'use client';

import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';

const STEPPER =
	'flex h-9 w-9 items-center justify-center rounded-[2px] border border-line bg-paper text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-35';

/** Optional extras with a quantity stepper, then "Continue". */
export function AddOnsStep({
	addOns,
	loading,
	selected,
	currency,
	onQuantity,
	onDone,
}: {
	addOns: AddOnListItemResponse[];
	loading: boolean;
	selected: Map<string, number>;
	currency: string;
	onQuantity: (id: string, quantity: number) => void;
	onDone: () => void;
}) {
	return (
		<div>
			{loading ? (
				<div className="space-y-2" aria-busy="true" aria-label="Loading extras">
					<span className="block h-16 animate-pulse rounded-[4px] bg-plaster-deep" />
					<span className="block h-16 animate-pulse rounded-[4px] bg-plaster-deep" />
				</div>
			) : addOns.length === 0 ? (
				<p className="text-sm text-graphite">Nothing extra to add here. Grip socks are on sale at the desk.</p>
			) : (
				<ul className="divide-y divide-line border-y border-line" role="list">
					{addOns.map((a) => {
						const qty = selected.get(a.id) ?? 0;
						const max = a.maxQuantity ?? 9;
						const blurb = siteConfig.addOns[a.slug]?.blurb ?? a.description;
						return (
							<li key={a.id} className="flex items-center gap-4 py-4">
								<div className="min-w-0 flex-1">
									<p className="headline text-ink">{a.title}</p>
									{blurb ? <p className="mt-0.5 text-sm text-graphite">{blurb}</p> : null}
								</div>
								<span className="tabular text-sm text-ink max-sm:hidden">{formatPrice(a.price, currency)}</span>
								<div className="flex items-center gap-2" role="group" aria-label={`${a.title} quantity`}>
									<button type="button" className={STEPPER} onClick={() => onQuantity(a.id, qty - 1)} disabled={qty <= 0} aria-label={`Remove one ${a.title}`}>
										−
									</button>
									<span className="tabular w-5 text-center" aria-live="polite">{qty}</span>
									<button type="button" className={STEPPER} onClick={() => onQuantity(a.id, qty + 1)} disabled={qty >= max} aria-label={`Add one ${a.title}`}>
										+
									</button>
								</div>
							</li>
						);
					})}
				</ul>
			)}
			<Button className="mt-6" onClick={onDone}>
				Continue
			</Button>
		</div>
	);
}
