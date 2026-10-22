'use client';

import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { countdownLabel } from '@/components/confirmation/pass-helpers';

/**
 * "Starts in 2 d 4 h" under the pass time. Ticks every 30 s; renders an empty,
 * fixed-height line until hydrated so SSR and client agree.
 */
export function Countdown({ start, end, className }: { start: number; end: number; className?: string }) {
	const now = useNow(30_000);
	const label = now ? countdownLabel(start, end, now.getTime()) : '';
	const live = label === 'On now';
	return (
		<p className={clsx('eyebrow flex min-h-[1.1em] items-center gap-2', live ? 'text-spring-green' : 'text-graphite', className)}>
			{label ? <span aria-hidden className={clsx('h-1.5 w-1.5 rounded-[1px]', live ? 'bg-spring-green' : 'bg-steel')} /> : null}
			{label}
		</p>
	);
}
