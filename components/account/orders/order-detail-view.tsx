'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { Tag } from '@/components/ui/chip';
import { AccountHeading } from '@/components/account/account-heading';
import { AccountError, AccountLoading } from '@/components/account/account-states';
import { dayLabel, toBookingView } from '@/components/account/booking-view';
import { OrderSummary } from '@/components/confirmation/order-summary';
import { CalendarLinks } from '@/components/confirmation/calendar-links';

const SWR_OPTS = { revalidateOnFocus: false } as const;

/** One order: its classes (each links to its check-in pass) and the totals. */
export function OrderDetailView({ id }: { id: string }) {
	const { data: order, error, isLoading, mutate } = useSWR<OrderDetailResponse>(`/api/account/orders/${encodeURIComponent(id)}`, fetcher, SWR_OPTS);
	const views = useMemo(
		() =>
			(order?.lineItems ?? [])
				.map((li) => li.appointment)
				.filter((a) => a != null)
				.map((a) => toBookingView(a))
				.sort((a, b) => a.start - b.start),
		[order],
	);
	const upcoming = views.filter((v) => v.status === 'scheduled');

	return (
		<div className="container-x">
			<AccountHeading
				eyebrow={order ? `Placed ${dayLabel(Date.parse(order.createdAt))}` : 'Order'}
				title={order ? `Order ${order.name}` : 'Order'}
				aside={
					<Link href="/account/orders" className="link-underline text-sm text-ink">
						<span aria-hidden>←</span> All orders
					</Link>
				}
			/>
			{error && !order ? (
				<AccountError what="this order" onRetry={() => void mutate()} />
			) : isLoading || !order ? (
				<AccountLoading label="Loading order" />
			) : (
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
					<section aria-label="Classes in this order">
						<ul className="border-t border-ink">
							{views.map((v) => (
								<li key={v.id} className="border-b border-line">
									<Link
										href={`/account/appointments/${v.id}`}
										className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 transition-colors hover:bg-plaster-deep/50 focus-visible:outline-2 focus-visible:outline-ink sm:px-2"
									>
										<span className="tabular text-sm text-graphite">
											{v.dayLabel}
											<span className="block text-lg text-ink">{v.time}</span>
										</span>
										<span className="min-w-0">
											<span className="flex items-center gap-2 font-semibold text-ink">
												<SpringCoil spring={v.spring} />
												<span className="truncate">{v.title}</span>
											</span>
											<span className="mt-0.5 block text-sm text-graphite">
												{v.studio?.short ?? v.locationTitle ?? 'Online'}
												{v.teacher ? ` · ${v.teacher}` : ''}
											</span>
										</span>
										{v.status === 'canceled' ? <Tag tone="red">Cancelled</Tag> : <span aria-hidden>→</span>}
									</Link>
								</li>
							))}
						</ul>
						{upcoming.length ? <CalendarLinks views={upcoming} className="mt-6" /> : null}
					</section>
					<OrderSummary order={order} className="lg:sticky lg:top-28 lg:self-start" />
				</div>
			)}
		</div>
	);
}
