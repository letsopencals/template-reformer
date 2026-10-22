import { StubPage } from '@/components/layout/stub-page';

export const dynamic = 'force-dynamic';

// TODO(P5 account): "Your week" with cancel/reschedule (12 h policy), Join for online
// classes, feedback, and the level path (lib/level-path.ts).
export default function AccountPage() {
	return <StubPage eyebrow="Your account" title="Your week" owner="P5 account + confirmation" />;
}
