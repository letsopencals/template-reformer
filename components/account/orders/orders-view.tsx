'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { OrderListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { AccountHeading } from '@/components/account/account-heading';
import { AccountError, AccountLoading } from '@/components/account/account-states';
import { dayLabel } from '@/components/account/booking-view';
import { paymentLabel } from '@/components/confirmation/order-summary';

const SWR_OPTS = { revalidateOnFocus: false, keepPreviousData: true } as const;
const TAKE = 15;

interface OrderPage {
	data: OrderListItemResponse[];
	meta: { page: number; hasNextPage: boolean; hasPreviousPage: boolean; itemCount: number };
}

/** Every order, newest first: number, date, what was in it, total and payment status. */
export function OrdersView() {
	const [page, setPage] = useState(1);
	const { data, error, isLoading, mutate } = useSWR<OrderPage>(`/api/account/orders?take=${TAKE}&page=${page}`, fetcher, SWR_OPTS);
	const orders = data?.data ?? [];

	return (
		<div className="container-x">
			<AccountHeading eyebrow="Your account" title="Orders" intro="Every booking you’ve paid for or reserved, with receipts of what was in it." />
			{error && !data ? (
				<AccountError what="your orders" onRetry={() => void mutate()} />
			) : isLoading && !data ? (
				<AccountLoading label="Loading orders" />
			) : orders.length ? (
				<>
					<ul className="border-t border-ink">
						{orders.map((o) => {
							const first = o.lineItems[0]?.appointment?.product?.title ?? 'Booking';
							const more = o.lineItems.length - 1;
							return (
								<li key={o.id} className="border-b border-line">
									<Link
										href={`/account/orders/${o.id}`}
										className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 transition-colors hover:bg-plaster-deep/50 focus-visible:outline-2 focus-visible:outline-ink sm:grid-cols-[7rem_minmax(0,1fr)_auto_auto] sm:px-2"
									>
										<span className="tabular text-sm text-graphite">{o.name}</span>
										<span className="col-start-1 min-w-0 truncate text-ink sm:col-start-auto">
											{first}
											{more > 0 ? <span className="text-graphite"> + {more} more</span> : null}
											<span className="tabular block text-xs text-steel">{dayLabel(Date.parse(o.createdAt))}</span>
										</span>
										<span className="eyebrow row-start-1 text-right text-steel sm:row-start-auto">{paymentLabel(o)}</span>
										<span className="tabular text-right text-ink">{formatPrice(o.total, o.paymentCurrencyCode || siteConfig.currency)}</span>
									</Link>
								</li>
							);
						})}
					</ul>
					<nav aria-label="Order pages" className="mt-6 flex items-center justify-between text-sm">
						<button type="button" disabled={!data?.meta.hasPreviousPage} onClick={() => setPage((p) => p - 1)} className="link-underline text-ink disabled:opacity-30">
							<span aria-hidden>←</span> Newer
						</button>
						<span className="tabular text-steel">Page {page}</span>
						<button type="button" disabled={!data?.meta.hasNextPage} onClick={() => setPage((p) => p + 1)} className="link-underline text-ink disabled:opacity-30">
							Older <span aria-hidden>→</span>
						</button>
					</nav>
				</>
			) : (
				<p className="border-t border-ink pt-6 text-graphite">
					No orders yet.{' '}
					<Link href="/timetable" className="link-underline text-ink">
						See the timetable
					</Link>
				</p>
			)}
		</div>
	);
}
