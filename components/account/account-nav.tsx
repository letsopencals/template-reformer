'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { signOut, useSession } from 'next-auth/react';
import { SPRING_CARRIAGE } from '@/components/motion/easing';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';

const TABS = [
	{ href: '/account', label: 'Your week', match: (p: string) => p === '/account' || p.startsWith('/account/appointments') },
	{ href: '/account/orders', label: 'Orders', match: (p: string) => p.startsWith('/account/orders') },
	{ href: '/account/settings', label: 'Settings', match: (p: string) => p.startsWith('/account/settings') },
] as const;

const INSTANT = { duration: 0 } as const;

/** Account tabs: the active tab rides a carriage underline. Sign out on the right. */
export function AccountNav() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const reduce = useReducedMotion();
	const name = session?.customer?.firstName ?? null;

	return (
		<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line">
			<nav aria-label="Account" className="no-scrollbar -mb-px flex gap-6 overflow-x-auto">
				{TABS.map((t) => {
					const active = t.match(pathname);
					return (
						<Link
							key={t.href}
							href={t.href}
							aria-current={active ? 'page' : undefined}
							className={clsx(
								'eyebrow relative pt-2 pb-3.5 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
								active ? 'text-ink' : 'text-steel hover:text-ink',
							)}
						>
							{t.label}
							{active ? (
								<motion.span layoutId="account-tab" transition={reduce ? INSTANT : SPRING_CARRIAGE} className="absolute inset-x-0 bottom-0 h-[3px] rounded-[1px] bg-ink" />
							) : null}
						</Link>
					);
				})}
			</nav>
			<div className="flex items-center gap-4 pb-3 text-sm text-graphite">
				{name ? <span className="max-sm:hidden">Signed in as {name}</span> : null}
				<button type="button" onClick={() => void signOut({ callbackUrl: '/' })} className="link-underline text-ink">
					Sign out
				</button>
			</div>
		</div>
	);
}
