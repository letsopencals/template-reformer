import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/** Calm empty state for lists that load from the API (classes, times, teachers). */
export function EmptyState({ title, body, className }: { title: string; body?: string; className?: string }) {
	return (
		<div className={clsx('rounded-[4px] border border-dashed border-concrete px-6 py-10 text-center', className)}>
			<p className="headline text-lg text-ink">{title}</p>
			{body ? <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-graphite">{body}</p> : null}
			<a
				href={`mailto:${siteConfig.contact.email}`}
				className="link-underline tabular mt-4 inline-block text-[0.8rem] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			>
				{siteConfig.contact.email}
			</a>
		</div>
	);
}
