import { StubPage } from '@/components/layout/stub-page';

export const dynamic = 'force-dynamic';

// TODO(P5 account): profile + marketing consent.
export default function SettingsPage() {
	return <StubPage eyebrow="Your account" title="Settings" owner="P5 account + confirmation" />;
}
