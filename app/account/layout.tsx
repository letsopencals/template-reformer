import type { Metadata } from 'next';
import { AccountNav } from '@/components/account/account-nav';

export const metadata: Metadata = { title: 'Your account', robots: { index: false, follow: false } };

/**
 * Account shell: clears the fixed header, then the tab row (Your week, Orders,
 * Settings). Pages render their own heading. The middleware sends signed-out
 * visitors to /login and back. Account data loads on the client through
 * /api/account/* (the refreshed token only reaches API routes).
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="pt-28 pb-24 lg:pt-32">
			<div className="container-x">
				<AccountNav />
			</div>
			{children}
		</div>
	);
}
