import { AccountHome } from '@/components/account/account-home';

export const dynamic = 'force-dynamic';

/**
 * "Your week": upcoming classes with move/cancel (12 h cutoff), Join for online
 * classes, feedback after a class, the level path and studios visited.
 */
export default function AccountPage() {
	return <AccountHome />;
}
