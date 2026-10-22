import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

/**
 * Ink band that sends people to the privates wizard, pre-filled with a studio
 * (`/privates?studio=<key>`) or an instructor (`/privates?instructor=<slug>`).
 */
export function PrivatesBand({ title, body, href, price }: { title: string; body: string; href: string; price?: string | null }) {
	return (
		<section className="grain rounded-[4px] bg-ink text-paper">
			<div className="flex flex-col gap-8 px-6 py-10 sm:px-10 md:flex-row md:items-end md:justify-between md:py-14">
				<div className="max-w-xl">
					<p className="eyebrow text-paper/50">Private sessions</p>
					<h2 className="display-sm mt-3">{title}</h2>
					<p className="mt-4 leading-relaxed text-paper/70">{body}</p>
				</div>
				<div className="flex flex-col items-start gap-3 md:items-end">
					{price ? <p className="tabular text-sm text-paper/70">{price}</p> : null}
					<Link href={href} className={buttonClasses({ variant: 'inverse', size: 'lg' })}>
						Book a private
					</Link>
				</div>
			</div>
		</section>
	);
}
