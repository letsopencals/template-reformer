import type { Metadata } from 'next';
import { StubPage } from '@/components/layout/stub-page';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = { title: 'Private sessions', description: siteConfig.privates.tagline };
export const revalidate = 300;

// TODO(P3 privates): wizard studio → 1:1 or Duet → instructor or "first available" → time.
// A duet sends customAttributes.people = "2" (siteConfig.customAttributeKeys.people).
export default function PrivatesPage() {
	return <StubPage eyebrow="Privates" title="Private sessions" intro={siteConfig.privates.tagline} owner="P3 privates/workshops" />;
}
