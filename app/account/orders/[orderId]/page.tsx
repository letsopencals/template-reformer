import { OrderDetailView } from '@/components/account/orders/order-detail-view';

export const dynamic = 'force-dynamic';

type Params = Promise<{ orderId: string }>;

/** One order: its classes and totals. */
export default async function OrderPage({ params }: { params: Params }) {
	const { orderId } = await params;
	return <OrderDetailView id={orderId} />;
}
