'use client';

import { memo } from 'react';
import { buttonClasses, type ButtonSize } from '@/components/ui/button';
import { useNow } from '@/hooks/use-now';
import { getJoinState } from '@/lib/booking-meta';
import { siteConfig } from '@/lib/site-config';

/**
 * "Join class" for a Tensile at Home booking. Live from `joinWindowMinutes`
 * before the start until the end; before that it says when it opens. Checks
 * every 20 s so it switches on without a reload. Renders nothing once the
 * class is over. Server and first client render show the closed state.
 */
export const JoinButton = memo(function JoinButton({
	joinUrl,
	from,
	to,
	size = 'sm',
	fullWidth,
}: {
	joinUrl: string;
	from: string;
	to: string;
	size?: ButtonSize;
	fullWidth?: boolean;
}) {
	const now = useNow(20_000);
	const state = now ? getJoinState(from, to, now.getTime()) : 'early';

	if (state === 'ended') return null;

	if (state === 'early') {
		return (
			<span
				aria-disabled="true"
				title={`The link opens ${siteConfig.joinWindowMinutes} minutes before class`}
				className={buttonClasses({ variant: 'outline', size, fullWidth, className: 'pointer-events-none opacity-55' })}
			>
				<CameraIcon />
				Join opens {siteConfig.joinWindowMinutes} min before
			</span>
		);
	}

	return (
		<a href={joinUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'primary', size, fullWidth })}>
			<span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-[1px] bg-spring-green" />
			Join class
			<span className="sr-only"> (opens in a new tab)</span>
		</a>
	);
});

function CameraIcon() {
	return (
		<svg aria-hidden viewBox="0 0 20 14" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
			<rect x="1" y="1.5" width="12" height="11" rx="1.5" />
			<path d="M13 5.5 19 2.5v9L13 8.5" strokeLinejoin="round" />
		</svg>
	);
}
