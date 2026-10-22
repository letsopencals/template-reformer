import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Your account', robots: { index: false, follow: false } };

// TODO(P5 account): account shell (nav: Your week, Settings).
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return children;
}
