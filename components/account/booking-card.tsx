import Link from 'next/link';
import { SpringChip } from '@/components/motifs/spring-chip';
import { Tag } from '@/components/ui/chip';
import { classMeta } from '@/lib/site-config';
import type { BookingView } from '@/components/account/booking-view';
import { BookingActions } from '@/components/account/booking-actions';
import { JoinButton } from '@/components/account/join-button';

/**
 * One upcoming booking on "Your week": mono start time, class with its spring,
 * where and with whom, then Join (online) and Move / Cancel with the policy
 * line. The title links to the full check-in pass.
 */
export function BookingCard({ view, onChanged }: { view: BookingView; onChanged: () => void }) {
	const level = classMeta(view.classKey)?.level ?? null;
	const where = view.isOnline ? 'Tensile at Home · live online' : [view.studio?.short ?? view.locationTitle, view.room?.name].filter(Boolean).join(' · ');
	return (
		<article className="grid gap-x-6 gap-y-4 rounded-[4px] border border-line bg-paper p-5 transition-colors hover:border-concrete sm:grid-cols-[5.5rem_minmax(0,1fr)] lg:grid-cols-[5.5rem_minmax(0,1fr)_auto] lg:items-start">
			<div className="flex items-baseline gap-3 sm:block">
				<p className="tabular text-[2rem] leading-none font-medium tracking-[-0.04em] text-ink">{view.time}</p>
				<p className="eyebrow text-steel sm:mt-2">
					{view.minutes} min
				</p>
			</div>

			<div className="min-w-0">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<SpringChip spring={view.spring} />
					{level ? <span className="eyebrow text-steel">{level}</span> : null}
					{view.people > 1 ? <Tag tone="outline">Duet · {view.people} people</Tag> : null}
				</div>
				<h3 className="headline mt-2 text-lg leading-snug">
					<Link href={`/account/appointments/${view.id}`} className="link-underline text-ink">
						{view.title}
					</Link>
				</h3>
				<p className="mt-1 text-sm text-graphite">
					{where}
					{view.teacher ? ` · with ${view.teacher}` : ''}
				</p>
			</div>

			<div className="flex flex-col gap-3 sm:col-start-2 lg:col-start-auto lg:items-end lg:text-right">
				{view.isOnline && view.joinUrl ? <JoinButton joinUrl={view.joinUrl} from={view.startIso} to={view.endIso} /> : null}
				<BookingActions view={view} onChanged={onChanged} className="lg:flex lg:max-w-[17rem] lg:flex-col lg:items-end" />
			</div>
		</article>
	);
}
