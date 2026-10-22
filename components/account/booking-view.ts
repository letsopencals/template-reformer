import { getBookingMeta, type AppointmentLike, type BookingMeta } from '@/lib/booking-meta';
import { springFromColor } from '@/lib/catalog';
import { localParts } from '@/lib/timetable';
import {
	classMeta,
	privateRoomFor,
	roomFor,
	siteConfig,
	studioMeta,
	workshopMeta,
	type RoomMeta,
	type Spring,
	type StudioMeta,
} from '@/lib/site-config';

/**
 * One booking as the account and confirmation pages show it. Pure: built from
 * any appointment shape the API returns (list, detail, order line), plus the
 * template's site-config (spring, room, what to bring). Never reads
 * `internalNote` or checkout answers.
 */

/** Structural subset of the SDK appointment shapes this view needs. */
export interface BookingAppt extends AppointmentLike {
	id: string;
	status?: string | null;
	productId?: string | null;
	staffMemberId?: string | null;
	locationId?: string | null;
	product?:
		| (NonNullable<AppointmentLike['product']> & {
				id?: string | null;
				duration?: number | null;
				cancelGap?: number | null;
				rescheduleGap?: number | null;
				allowCustomerCancel?: boolean | null;
				allowCustomerReschedule?: boolean | null;
		  })
		| null;
	location?: (NonNullable<AppointmentLike['location']> & { id?: string | null; slug?: string | null }) | null;
}

export interface BookingView extends BookingMeta {
	id: string;
	status: string;
	/** Epoch ms. */
	start: number;
	end: number;
	startIso: string;
	endIso: string;
	/** Berlin local date `YYYY-MM-DD`, `HH:mm`, ISO weekday. */
	date: string;
	time: string;
	endTime: string;
	weekday: number;
	/** "Tue 27 Oct" */
	dayLabel: string;
	minutes: number;
	spring: Spring;
	studio: StudioMeta | null;
	studioSlug: string | null;
	room: RoomMeta | null;
	whatToBring: string[];
	/** Variant id: the product to book and reschedule. */
	productId: string | null;
	productSlug: string | null;
	staffMemberId: string | null;
	locationId: string | null;
	/** The appointment this view was built from (policy fields, ids). */
	source: BookingAppt;
}

const DAY_LABEL = new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, weekday: 'short', day: 'numeric', month: 'short' });
const PRIVATE_KIT = ['Grip socks', 'Water'];

/** "Tue 27 Oct" in studio time. */
export function dayLabel(ms: number): string {
	return DAY_LABEL.format(ms).replace(',', '');
}

/** The class's spring: site-config first, then the product's dashboard colour. */
export function springForBooking(classKey: string | null, color: string | null | undefined): Spring {
	if (classKey === 'private') return siteConfig.privates.spring;
	return classMeta(classKey)?.spring ?? workshopMeta(classKey)?.spring ?? springFromColor(color);
}

/** The room the booking runs in (private room for privates), or null (online, workshops, unknown). */
export function roomForBooking(classKey: string | null, studioSlug: string | null | undefined): RoomMeta | null {
	if (classKey === 'private') return privateRoomFor(studioSlug);
	return roomFor(classKey, studioSlug);
}

function kitFor(classKey: string | null): string[] {
	if (classKey === 'private') return PRIVATE_KIT;
	return classMeta(classKey)?.whatToBring ?? workshopMeta(classKey)?.whatToBring ?? [];
}

export function toBookingView(appt: BookingAppt): BookingView {
	const meta = getBookingMeta(appt);
	const start = Date.parse(appt.from);
	const end = Date.parse(appt.to);
	const parts = localParts(start);
	const studioSlug = appt.location?.slug ?? null;
	return {
		...meta,
		id: appt.id,
		status: appt.status ?? 'scheduled',
		start,
		end,
		startIso: appt.from,
		endIso: appt.to,
		date: parts.date,
		time: parts.time,
		endTime: localParts(end).time,
		weekday: parts.weekday,
		dayLabel: dayLabel(start),
		minutes: Math.max(0, Math.round((end - start) / 60_000)),
		spring: springForBooking(meta.classKey, appt.product?.color),
		studio: studioMeta(studioSlug),
		studioSlug,
		room: meta.isOnline ? null : roomForBooking(meta.classKey, studioSlug),
		whatToBring: kitFor(meta.classKey),
		productId: appt.product?.id ?? appt.productId ?? null,
		productSlug: appt.product?.slug ?? null,
		staffMemberId: appt.staffMemberId ?? null,
		locationId: appt.location?.id ?? appt.locationId ?? null,
		source: appt,
	};
}

/** Short class name for copy ("Flow"), falling back to the product title. */
export function shortTitle(view: Pick<BookingView, 'classKey' | 'title'>): string {
	return classMeta(view.classKey)?.short ?? view.title;
}
