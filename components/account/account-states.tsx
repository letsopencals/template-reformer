import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { RoomPlan } from '@/components/motifs/room-plan';
import { Spinner } from '@/components/auth/auth-feedback';
import { siteConfig } from '@/lib/site-config';
import { timetableHref } from '@/lib/timetable-url';

const EMPTY_ROOM = siteConfig.studios['tensile-kreuzberg'].rooms[0]!;

/** Loading: a ruled board with a carriage spinner. */
export function AccountLoading({ label = 'Loading your week' }: { label?: string }) {
	return (
		<div aria-busy className="border-t border-ink">
			{[0, 1, 2].map((i) => (
				<div key={i} className="grid gap-4 border-b border-line py-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8">
					<div className="h-5 w-24 animate-pulse rounded-[2px] bg-plaster-deep" />
					<div className="h-24 animate-pulse rounded-[4px] bg-plaster-deep/70" />
				</div>
			))}
			<div className="pt-6">
				<Spinner label={label} />
			</div>
		</div>
	);
}

/** Error with a retry. */
export function AccountError({ onRetry, what = 'your bookings' }: { onRetry: () => void; what?: string }) {
	return (
		<div role="alert" className="rounded-[4px] border border-line bg-paper p-6 sm:p-8">
			<p className="headline text-lg text-ink">We couldn’t load {what}.</p>
			<p className="mt-2 text-sm text-graphite">Your bookings are safe. Check your connection and try again.</p>
			<button type="button" onClick={onRetry} className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-5' })}>
				Try again
			</button>
		</div>
	);
}

/** Nothing upcoming: an empty room and the way to the timetable. */
export function EmptyWeek({ firstTime }: { firstTime: boolean }) {
	return (
		<div className="grid items-center gap-8 rounded-[4px] border border-line bg-paper p-6 sm:p-10 md:grid-cols-[1fr_minmax(0,18rem)]">
			<div>
				<p className="eyebrow text-steel">Your week</p>
				<p className="display-sm mt-3 text-ink">{firstTime ? 'Your first bed is waiting.' : 'Nothing booked yet.'}</p>
				<p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-graphite">
					{firstTime ? siteConfig.introOffer.body : `Classes open ${siteConfig.policies.bookingWindowDays} days ahead. The evening ones fill first.`}
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link href="/timetable" className={buttonClasses({})}>
						See the timetable
					</Link>
					{firstTime ? (
						<Link href={timetableHref({ class: 'foundations' })} className={buttonClasses({ variant: 'outline' })}>
							Find a Foundations class
						</Link>
					) : null}
				</div>
			</div>
			<div aria-hidden className="mx-auto w-full max-w-[18rem] opacity-80">
				<RoomPlan room={EMPTY_ROOM} />
			</div>
		</div>
	);
}
