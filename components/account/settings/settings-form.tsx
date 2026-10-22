'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { SelfServiceProfileResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { FieldLabel, Input } from '@/components/ui/input';
import { Notice } from '@/components/auth/auth-feedback';
import { fetcher } from '@/lib/fetcher';
import { AccountError, AccountLoading } from '@/components/account/account-states';

const PROFILE_KEY = '/api/account/profile';
const SWR_OPTS = { revalidateOnFocus: false } as const;

/** Profile fields the customer can change: name and phone. Email is the sign-in, so it's read-only. */
export function SettingsForm() {
	const { data, error, isLoading, mutate } = useSWR<SelfServiceProfileResponse>(PROFILE_KEY, fetcher, SWR_OPTS);
	if (error && !data) return <AccountError what="your details" onRetry={() => void mutate()} />;
	if (isLoading || !data) return <AccountLoading label="Loading your details" />;
	return <ProfileFields key={data.id} profile={data} onSaved={(p) => void mutate(p, { revalidate: false })} />;
}

function ProfileFields({ profile, onSaved }: { profile: SelfServiceProfileResponse; onSaved: (p: SelfServiceProfileResponse) => void }) {
	const [firstName, setFirstName] = useState(profile.firstName ?? '');
	const [lastName, setLastName] = useState(profile.lastName ?? '');
	const [phone, setPhone] = useState(profile.phone ?? '');
	const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
	const [message, setMessage] = useState<string | null>(null);
	const dirty = firstName !== (profile.firstName ?? '') || lastName !== (profile.lastName ?? '') || phone !== (profile.phone ?? '');

	const save = async () => {
		setStatus('saving');
		setMessage(null);
		try {
			const res = await fetch(PROFILE_KEY, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() }),
			});
			const body = await res.json().catch(() => null);
			if (!res.ok) throw new Error(body?.error || 'We couldn’t save that.');
			onSaved(body as SelfServiceProfileResponse);
			setStatus('saved');
		} catch (err) {
			setStatus('error');
			setMessage(err instanceof Error ? err.message : 'We couldn’t save that.');
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				void save();
			}}
			className="max-w-xl space-y-6"
		>
			{status === 'saved' && !dirty ? <Notice tone="success">Saved. Your teachers will see the new details on the class list.</Notice> : null}
			{status === 'error' && message ? <Notice>{message}</Notice> : null}
			<div className="grid gap-5 sm:grid-cols-2">
				<div>
					<FieldLabel htmlFor="set-first">First name</FieldLabel>
					<Input id="set-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} />
				</div>
				<div>
					<FieldLabel htmlFor="set-last">Last name</FieldLabel>
					<Input id="set-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} />
				</div>
			</div>
			<div>
				<FieldLabel htmlFor="set-phone">Phone</FieldLabel>
				<Input id="set-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} placeholder="+49 …" />
				<p className="mt-2 text-xs text-steel">Only used if we need to reach you about a class today.</p>
			</div>
			<div>
				<FieldLabel htmlFor="set-email">Email</FieldLabel>
				<Input id="set-email" type="email" value={profile.email ?? ''} readOnly aria-describedby="set-email-note" className="text-graphite" />
				<p id="set-email-note" className="mt-2 text-xs text-steel">
					Your sign-in. We email your codes and booking links here.
				</p>
			</div>
			<Button type="submit" size="lg" disabled={!dirty || status === 'saving'}>
				{status === 'saving' ? 'Saving…' : 'Save changes'}
			</Button>
		</form>
	);
}
