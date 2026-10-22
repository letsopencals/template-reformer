'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resolveLink, type ResolveLinkResult } from '@/app/auth/actions/resolve-link';
import { buttonClasses } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/auth-shell';
import { Spinner } from '@/components/auth/auth-feedback';
import { siteConfig } from '@/lib/site-config';
import { normalizeRedirect } from '@/lib/link-redirect';

type ErrorCode = NonNullable<ResolveLinkResult['errorCode']>;

const ERROR_COPY: Record<ErrorCode, { title: string; message: string }> = {
	TOKEN_EXPIRED: {
		title: 'This link has\nexpired.',
		message: 'Email links expire after a while to keep your bookings safe. Sign in with a code instead; it takes a minute.',
	},
	TOKEN_USED: { title: 'Link already\nused.', message: 'Each link works once. Sign in with a code to carry on.' },
	TOKEN_INVALID: { title: 'We don’t know\nthis link.', message: 'It may be incomplete. Copy the whole link from the email, or sign in with a code.' },
};

/**
 * Magic-link landing (`/link/[token]` from booking emails): resolves the token
 * once (server action signs the customer in), then replaces the URL with the
 * target, normalised by `lib/link-redirect.ts`.
 */
export function LinkResolver({ token }: { token: string }) {
	const router = useRouter();
	const [status, setStatus] = useState<'resolving' | 'error'>('resolving');
	const [errorCode, setErrorCode] = useState<ErrorCode>('TOKEN_INVALID');
	const ranRef = useRef(false);

	useEffect(() => {
		if (!token || ranRef.current) return;
		ranRef.current = true;

		(async () => {
			try {
				const result = await resolveLink(token);
				if (result.success && result.redirectPath) {
					router.replace(normalizeRedirect(result.redirectPath));
					router.refresh();
					return;
				}
				setErrorCode(result.errorCode ?? 'TOKEN_INVALID');
			} catch {
				setErrorCode('TOKEN_INVALID');
			}
			setStatus('error');
		})();
	}, [token, router]);

	if (status === 'resolving') {
		return (
			<AuthShell label="Secure link" title={'One\nmoment.'} centered>
				<div className="flex flex-col items-center gap-5 text-sm text-graphite">
					<Spinner label="Signing you in" />
					Opening your booking…
				</div>
			</AuthShell>
		);
	}

	const copy = ERROR_COPY[errorCode];
	return (
		<AuthShell
			key="error"
			label="Secure link"
			title={copy.title}
			intro={copy.message}
			footer={
				<>
					Need a hand? Email{' '}
					<a href={`mailto:${siteConfig.contact.email}`} className="link-underline text-ink">
						{siteConfig.contact.email}
					</a>
					.
				</>
			}
		>
			<Link href="/login" className={buttonClasses({ size: 'lg', fullWidth: true })}>
				Sign in with a code
			</Link>
		</AuthShell>
	);
}
