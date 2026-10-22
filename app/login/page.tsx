import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
// Only same-site paths are allowed as callbacks (no backslashes, same origin once resolved).
import { safeCallback } from '@/app/api/_lib/guards';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

type Search = Promise<{ callbackUrl?: string | string[]; email?: string | string[] }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Passwordless sign-in: email → 6-digit code. Booking emails also carry a /link/[token] magic link. */
export default async function LoginPage({ searchParams }: { searchParams: Search }) {
	const query = await searchParams;
	return <LoginForm callbackUrl={safeCallback(first(query.callbackUrl))} initialEmail={first(query.email) ?? ''} />;
}
