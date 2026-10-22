import type { Metadata } from 'next';
import { ThankYouView } from '@/components/confirmation/thank-you-view';

export const metadata: Metadata = { title: 'Booked', robots: { index: false, follow: false } };

type Search = Promise<{ orderId?: string | string[] }>;

/**
 * Confirmation: one check-in pass per booked class (room plan with your spot
 * held, countdown, calendar links, "same time next week?"). The order loads on
 * the client because it needs the customer's session; submit may return no
 * `auth` (SDK 0.3.18), and then the page offers a sign-in code instead.
 */
export default async function ThankYouPage({ searchParams }: { searchParams: Search }) {
	const raw = (await searchParams).orderId;
	const orderId = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;
	return <ThankYouView orderId={orderId} />;
}
