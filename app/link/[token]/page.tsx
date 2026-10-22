import type { Metadata } from 'next';
import { LinkResolver } from '@/components/auth/link-resolver';

export const metadata: Metadata = { title: 'Opening your booking', robots: { index: false, follow: false } };

type Params = Promise<{ token: string }>;

/** Magic link from booking emails: resolves on the client, then redirects. */
export default async function LinkPage({ params }: { params: Params }) {
	const { token } = await params;
	return <LinkResolver token={token} />;
}
