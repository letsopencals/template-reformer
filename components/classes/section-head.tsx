import Link from 'next/link';
import { clsx } from 'clsx';

/** Section title for detail pages: mono eyebrow, headline, optional link on the right. */
export function SectionHead({
	id,
	eyebrow,
	title,
	link,
	className,
}: {
	id: string;
	eyebrow: string;
	title: React.ReactNode;
	link?: { href: string; label: string } | null;
	className?: string;
}) {
	return (
		<div className={clsx('mb-8 flex flex-wrap items-end justify-between gap-4', className)}>
			<div>
				<p className="eyebrow text-graphite">{eyebrow}</p>
				<h2 id={id} className="display-sm mt-3 text-ink">
					{title}
				</h2>
			</div>
			{link ? (
				<Link href={link.href} className="eyebrow link-underline text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
					{link.label} →
				</Link>
			) : null}
		</div>
	);
}
