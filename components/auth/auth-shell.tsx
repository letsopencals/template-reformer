import Link from 'next/link';
import { clsx } from 'clsx';
import { Logo } from '@/components/layout/logo';
import { Reveal, RevealText } from '@/components/motion/reveal';
import { RoomPlan } from '@/components/motifs/room-plan';
import { siteConfig } from '@/lib/site-config';

export interface AuthShellProps {
	label?: string;
	/** Display heading. Use `\n` for deliberate line breaks. */
	title: string;
	intro?: React.ReactNode;
	/** Centre the copy (status screens: link resolving, errors). */
	centered?: boolean;
	children?: React.ReactNode;
	/** Line under the form (e.g. "No account yet? ..."). */
	footer?: React.ReactNode;
}

const MITTE_LONG_ROOM = siteConfig.studios['tensile-mitte'].rooms[0]!;

/**
 * Split auth layout: an ink panel with the Long Room plan on large screens, the
 * form on plaster on the right. Phones get the form only.
 */
export function AuthShell({ label = 'Your account', title, intro, centered, children, footer }: AuthShellProps) {
	return (
		<section className="grid min-h-screen bg-plaster lg:grid-cols-[1fr_1fr]">
			<aside className="relative hidden bg-ink p-14 pt-32 text-paper lg:flex lg:flex-col lg:justify-between" aria-hidden>
				<p className="eyebrow text-paper/50">{siteConfig.tagline}</p>
				<div className="mx-auto w-full max-w-md opacity-90 invert">
					<RoomPlan room={MITTE_LONG_ROOM} taken={7} showLabels={false} />
				</div>
				<p className="max-w-sm text-[0.95rem] leading-relaxed text-paper/70">
					Your week of classes, bed holds, cancellations and your level path, in one place.
				</p>
			</aside>

			<div className="flex items-center justify-center px-6 pt-28 pb-20 lg:px-16">
				<div className={clsx('w-full max-w-[420px]', centered && 'text-center')}>
					<Link href="/" className="mb-10 inline-block lg:hidden" aria-label={`${siteConfig.name} home`}>
						<Logo />
					</Link>
					<p className="eyebrow mb-5 text-graphite">{label}</p>
					<RevealText as="h1" text={title} trigger="mount" className="display-md text-ink" lineClassName="pb-[0.06em]" />
					{intro ? <div className="mt-5 text-[0.95rem] leading-relaxed text-graphite">{intro}</div> : null}
					<Reveal delay={0.15} className="mt-10">
						{children}
					</Reveal>
					{footer ? <div className="mt-10 border-t border-line pt-6 text-sm text-graphite">{footer}</div> : null}
				</div>
			</div>
		</section>
	);
}

/** Inline text link used in auth footers. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link href={href} className="link-underline text-ink">
			{children}
		</Link>
	);
}
