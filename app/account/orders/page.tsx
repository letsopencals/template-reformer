import { OrdersView } from '@/components/account/orders/orders-view';

export const dynamic = 'force-dynamic';

/** Every order, newest first. */
export default function OrdersPage() {
	return <OrdersView />;
}
