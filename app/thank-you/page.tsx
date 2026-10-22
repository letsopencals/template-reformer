import type { Metadata } from 'next';
import { StubPage } from '@/components/layout/stub-page';

export const metadata: Metadata = { title: 'Booked', robots: { index: false, follow: false } };

type Search = Promise<{ orderId?: string }>;

// TODO(P5 confirmation): check-in pass with the bed held in the room drawing, ICS/Google
// links (lib/calendar.ts), "same time next week?". Submit may return no `auth` (SDK 0.3.18):
// then show "sign in with a code to see this booking".
export default async function ThankYouPage({ searchParams }: { searchParams: Search }) {
	const { orderId } = await searchParams;
	return <StubPage eyebrow={orderId ? `Order ${orderId.slice(0, 8)}` : 'Booked'} title="You’re on the reformer" owner="P5 account + confirmation" />;
}
