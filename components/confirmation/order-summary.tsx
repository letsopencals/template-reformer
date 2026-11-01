import { clsx } from 'clsx';
import type { OrderDetailResponse, OrderDetailTransaction, PaymentProviderName } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';

type OrderLike = Pick<
	OrderDetailResponse,
	'name' | 'paymentCurrencyCode' | 'subtotal' | 'total' | 'totalTax' | 'taxesIncluded' | 'isFullyPaid' | 'paymentStatus' | 'dueToPay' | 'refundedTotal' | 'lineItems' | 'transactions'
>;

type Tx = Partial<Pick<OrderDetailTransaction, 'provider' | 'gateway'>>;
type ManualProvider = Extract<PaymentProviderName, 'cash' | 'bank_transfer' | 'stripe_invoice'>;

/** The manual method an unpaid order is waiting on (cash, bank transfer, invoice), if any. */
export function manualProviderOf(order: { transactions?: Tx[] | null }): ManualProvider | null {
	for (const t of order.transactions ?? []) {
		const p = t.provider ?? t.gateway;
		if (p === 'cash' || p === 'bank_transfer' || p === 'stripe_invoice') return p;
	}
	return null;
}

/** "Paid", "Pay at the studio"… from the order's own fields. Never blank, never a raw status. */
export function paymentLabel(order: Pick<OrderLike, 'total' | 'isFullyPaid' | 'paymentStatus'> & { transactions?: Tx[] | null }): string {
	if (order.paymentStatus === 'voided') return 'Cancelled — not charged';
	if (!order.total) return 'Nothing to pay';
	if (order.isFullyPaid || order.paymentStatus === 'paid') return 'Paid';
	if (order.paymentStatus === 'partially-paid') return 'Part paid';
	switch (manualProviderOf(order)) {
		case 'cash':
			return 'Pay at the studio';
		case 'bank_transfer':
			return 'Bank transfer due';
		case 'stripe_invoice':
			return 'Invoice due';
		default:
			return 'Payment due';
	}
}

/** Order totals card: each line, add-ons, savings, tax, total and payment status. */
export function OrderSummary({ order, className }: { order: OrderLike; className?: string }) {
	const currency = order.paymentCurrencyCode || siteConfig.currency;
	const saved = order.lineItems.reduce((n, li) => n + (li.totalDiscount ?? 0), 0);
	return (
		<section aria-label="Order summary" className={clsx('rounded-[4px] border border-line bg-paper p-6', className)}>
			<div className="flex items-baseline justify-between gap-3">
				<h2 className="eyebrow text-steel">Order {order.name}</h2>
				<span className="eyebrow text-ink">{paymentLabel(order)}</span>
			</div>
			<ul className="mt-5 divide-y divide-line border-y border-line text-sm">
				{order.lineItems.map((li, i) => (
					<li key={li.appointmentId ?? i} className="py-3">
						<div className="flex items-baseline justify-between gap-4">
							<span className="min-w-0 text-ink">{li.appointment?.product?.title ?? 'Class'}</span>
							<span className="tabular shrink-0 text-ink">{formatPrice(li.discountedSubtotal, currency)}</span>
						</div>
						{li.addOnLineItems.map((a) => (
							<div key={a.id} className="mt-1 flex items-baseline justify-between gap-4 text-graphite">
								<span>
									+ {a.addOn?.title ?? 'Add-on'}
									{a.quantity > 1 ? ` × ${a.quantity}` : ''}
								</span>
								<span className="tabular">{formatPrice(a.discountedSubtotal, currency)}</span>
							</div>
						))}
					</li>
				))}
			</ul>
			<dl className="mt-4 space-y-2 text-sm">
				{saved > 0 ? <Row label="You saved" value={formatPrice(saved, currency)} /> : null}
				{order.totalTax > 0 ? <Row label={order.taxesIncluded ? 'VAT (included)' : 'VAT'} value={formatPrice(order.totalTax, currency)} /> : null}
				{order.refundedTotal > 0 ? <Row label="Refunded" value={formatPrice(order.refundedTotal, currency)} /> : null}
				<div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
					<dt className="eyebrow text-ink">Total</dt>
					<dd className="tabular text-xl text-ink">{formatPrice(order.total, currency)}</dd>
				</div>
			</dl>
		</section>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 text-graphite">
			<dt>{label}</dt>
			<dd className="tabular">{value}</dd>
		</div>
	);
}
