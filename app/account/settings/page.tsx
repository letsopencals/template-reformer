import { AccountHeading } from '@/components/account/account-heading';
import { SettingsForm } from '@/components/account/settings/settings-form';

export const dynamic = 'force-dynamic';

/** Name and phone; the email is the sign-in. */
export default function SettingsPage() {
	return (
		<div className="container-x">
			<AccountHeading eyebrow="Your account" title="Settings" intro="The name on the class list and a number for same-day changes." />
			<SettingsForm />
		</div>
	);
}
