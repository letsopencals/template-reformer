import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import type { BookingView } from '@/components/account/booking-view';
import { CalendarLinks } from '@/components/confirmation/calendar-links';
import { SameTimeNextWeek } from '@/components/confirmation/same-time-next-week';
import { directionsHref } from '@/components/confirmation/pass-helpers';

const isWeekly = (view: BookingView) => view.classKey !== 'private' && !view.classKey?.startsWith('workshop-');

/** Pass stub: what to bring, getting there, calendar and "same time next week?". */
export function PassFooter({ view, showNextWeek }: { view: BookingView; showNextWeek: boolean }) {
	// Site-config has the street; the API location may only carry city and postcode.
	const address = view.studio?.address ?? view.address ?? null;
	return (
		<div className="grid gap-8 px-6 py-7 sm:px-8 md:grid-cols-3">
			<section aria-labelledby={`bring-${view.id}`}>
				<h3 id={`bring-${view.id}`} className="eyebrow text-steel">
					What to bring
				</h3>
				{view.whatToBring.length ? (
					<ul className="mt-3 space-y-1.5 text-sm text-ink">
						{view.whatToBring.map((item) => (
							<li key={item} className="flex gap-2.5">
								<span aria-hidden className="mt-[0.55rem] h-px w-3 shrink-0 bg-ink" />
								{item}
							</li>
						))}
					</ul>
				) : (
					<p className="mt-3 text-sm text-graphite">Grip socks and water. We have the rest.</p>
				)}
			</section>

			<section aria-labelledby={`where-${view.id}`}>
				<h3 id={`where-${view.id}`} className="eyebrow text-steel">
					Getting there
				</h3>
				{view.isOnline ? (
					<p className="mt-3 text-sm text-ink">From home. The join link is in your account and on this pass.</p>
				) : (
					<>
						<p className="mt-3 text-sm text-ink">{address ?? view.locationTitle ?? 'Address in your confirmation email'}</p>
						{view.studio?.transit ? <p className="mt-1 text-sm text-graphite">{view.studio.transit}</p> : null}
						{address ? (
							<a href={directionsHref(address)} target="_blank" rel="noopener noreferrer" className="link-underline mt-3 inline-block text-sm text-ink">
								Directions <span aria-hidden>↗</span>
								<span className="sr-only"> (opens Google Maps in a new tab)</span>
							</a>
						) : null}
					</>
				)}
			</section>

			<section aria-labelledby={`cal-${view.id}`} className="space-y-4">
				<h3 id={`cal-${view.id}`} className="eyebrow text-steel">
					Keep it
				</h3>
				<CalendarLinks views={[view]} />
				{showNextWeek && isWeekly(view) ? <SameTimeNextWeek view={view} /> : null}
				{showNextWeek && !isWeekly(view) && view.bookAgainHref ? (
					<Link href={view.bookAgainHref} className="link-underline inline-block text-sm text-ink">
						{view.classKey === 'private' ? 'Book another private' : `See all ${siteConfig.name} workshops`} <span aria-hidden>→</span>
					</Link>
				) : null}
			</section>
		</div>
	);
}
