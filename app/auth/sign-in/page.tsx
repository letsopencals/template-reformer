import { redirect } from 'next/navigation';

type Search = Promise<Record<string, string | string[] | undefined>>;

/** Old/default NextAuth path: forward to /login, keeping the query. */
export default async function LegacySignIn({ searchParams }: { searchParams: Search }) {
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(await searchParams)) if (typeof v === 'string') q.set(k, v);
	redirect(`/login${q.size ? `?${q}` : ''}`);
}
