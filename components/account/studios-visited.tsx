import Link from 'next/link';
import { physicalStudioKeys } from '@/components/account/studio-keys';
import type { StudioVisit } from '@/components/account/account-insights';
import { studioMeta } from '@/lib/site-config';

/**
 * The studios a customer has trained in, with a count each, and the ones they
 * haven't tried yet. Counts come from their own past bookings.
 */
export function StudiosVisited({ visits }: { visits: StudioVisit[] }) {
	const seen = new Set(visits.map((v) => v.slug));
	const untried = physicalStudioKeys().filter((s) => !seen.has(s.slug));
	return (
		<section aria-labelledby="studios-heading" className="rounded-[4px] border border-line bg-paper p-6">
			<p id="studios-heading" className="eyebrow text-steel">
				Studios visited · {visits.length}
			</p>
			{visits.length ? (
				<ul className="mt-4 divide-y divide-line">
					{visits.map((v) => (
						<li key={v.slug} className="flex items-baseline justify-between gap-4 py-2.5">
							<span className="text-ink">{v.name}</span>
							<span className="tabular text-sm text-graphite">
								{v.count} {v.count === 1 ? 'class' : 'classes'}
							</span>
						</li>
					))}
				</ul>
			) : (
				<p className="mt-3 text-sm text-graphite">Your first class puts a pin here.</p>
			)}
			{untried.length ? (
				<p className="mt-4 text-sm text-graphite">
					Not tried yet:{' '}
					{untried.map((s, i) => (
						<span key={s.slug}>
							{i ? ', ' : ''}
							<Link href={`/studios/${s.key}`} className="link-underline text-ink">
								{studioMeta(s.slug)?.short ?? s.key}
							</Link>
						</span>
					))}
					.
				</p>
			) : null}
		</section>
	);
}
