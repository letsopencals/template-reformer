import { clsx } from 'clsx';
import { googleCalendarHref, icsHref, ICS_FILENAME, type CalendarEvent } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';
import type { BookingView } from '@/components/account/booking-view';

/** A booking as a calendar entry: the class, studio address (or join link), what to bring. */
export function toCalendarEvent(v: BookingView): CalendarEvent {
	const where = v.isOnline ? (v.joinUrl ?? 'Live online') : [v.studio?.name ?? v.locationTitle, v.address ?? v.studio?.address].filter(Boolean).join(', ');
	const lines = [
		v.teacher ? `With ${v.teacher}` : null,
		v.room ? `Room: ${v.room.name}` : null,
		v.whatToBring.length ? `Bring: ${v.whatToBring.join(', ')}` : null,
		`Manage this booking: ${siteConfig.url}/account/appointments/${v.id}`,
	].filter(Boolean);
	return { uid: v.id, title: `${v.title} · ${siteConfig.name}`, start: v.start, end: v.end, location: where || undefined, description: lines.join('\n') };
}

const LINK = 'eyebrow inline-flex h-9 items-center gap-2 rounded-[2px] border border-line bg-paper px-3 text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

/** .ics download (Apple, Outlook) + Google Calendar, for one or more bookings. */
export function CalendarLinks({ views, className }: { views: BookingView[]; className?: string }) {
	if (!views.length) return null;
	const events = views.map(toCalendarEvent);
	const single = views.length === 1;
	return (
		<div className={clsx('flex flex-wrap gap-2', className)}>
			<a href={icsHref(events)} download={ICS_FILENAME} className={LINK}>
				<CalIcon />
				{single ? 'Add to calendar' : `Add all ${views.length} to calendar`}
				<span className="sr-only"> (.ics file)</span>
			</a>
			{single ? (
				<a href={googleCalendarHref(events[0]!)} target="_blank" rel="noopener noreferrer" className={LINK}>
					Google Calendar
					<span className="sr-only"> (opens in a new tab)</span>
				</a>
			) : null}
		</div>
	);
}

function CalIcon() {
	return (
		<svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.3">
			<rect x="1" y="2" width="12" height="11" rx="1" />
			<path d="M1 5.5h12M4 1v2.5M10 1v2.5" />
		</svg>
	);
}
