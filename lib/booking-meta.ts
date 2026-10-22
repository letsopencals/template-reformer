import { classKeyForSlug } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

/**
 * Turns an appointment (list, detail or order-embedded) into the facts the
 * account and confirmation pages show for a booking: class key, who teaches it,
 * whether it's online (and the live link), the studio address, the people
 * count for a duet, and where "Book again" goes.
 *
 * Online vs in-studio comes from the booked location's `type`; the join link is
 * that location's `link`, set once on the Tensile at Home location in the
 * dashboard.
 */

interface AddressFields {
	addressLine1?: string | null;
	addressLine2?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	displayAddress?: string | null;
}

/** Structural subset shared by the SDK's appointment list, detail and order shapes. */
export interface AppointmentLike {
	from: string;
	to: string;
	numberOfAttendees?: number | null;
	staffMember?: {
		firstName?: string | null;
		lastName?: string | null;
		slug?: string | null;
		image?: { url?: string | null } | null;
	} | null;
	customAttributes?: Record<string, string> | null;
	product?: {
		title?: string | null;
		variantTitle?: string | null;
		slug?: string | null;
		color?: string | null;
		maxAttendees?: number | null;
		price?: number | null;
	} | null;
	location?: (AddressFields & {
		title?: string | null;
		type?: string | null;
		link?: string | null;
		address?: string | null;
	}) | null;
}

export interface BookingMeta {
	title: string;
	/** Class key (`flow`, `private`, `workshop-...`), from the product slug. */
	classKey: string | null;
	/** Variant title, e.g. "Mitte · Lena" or "Kreuzberg · Duet". */
	variant: string | null;
	/** "Class" | "Private session". */
	kindLabel: string;
	/** People on the booking (a duet is one seat for 2). */
	people: number;
	teacher: string | null;
	teacherFirstName: string | null;
	teacherImage: string | null;
	teacherSlug: string | null;
	isOnline: boolean;
	/** Live class link, when the location has one. */
	joinUrl: string | null;
	locationTitle: string | null;
	address: string | null;
	color: string | null;
	/** Where "Book again" should go. */
	bookAgainHref: string | null;
}

function joinAddress(a: AddressFields | null | undefined): string | null {
	if (!a) return null;
	if (a.displayAddress) return a.displayAddress;
	const parts = [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean);
	return parts.length ? parts.join(', ') : null;
}

function kindLabel(product: AppointmentLike['product']): string {
	return (product?.maxAttendees ?? 1) > 1 ? 'Class' : 'Private session';
}

export function getBookingMeta(appt: AppointmentLike): BookingMeta {
	const staff = appt.staffMember;
	const teacher = staff ? [staff.firstName, staff.lastName].filter(Boolean).join(' ') || null : null;
	const isOnline = appt.location?.type === siteConfig.locationTypes.online;
	const slug = appt.product?.slug ?? null;

	return {
		title: appt.product?.title ?? 'Class',
		classKey: classKeyForSlug(slug),
		variant: appt.product?.variantTitle || null,
		kindLabel: kindLabel(appt.product),
		people: appt.customAttributes?.[siteConfig.customAttributeKeys.people] === '2' ? 2 : Math.max(1, appt.numberOfAttendees ?? 1),
		teacher,
		teacherFirstName: staff?.firstName ?? null,
		teacherImage: staff?.image?.url ?? null,
		teacherSlug: staff?.slug ?? null,
		isOnline,
		joinUrl: isOnline ? appt.location?.link || null : null,
		locationTitle: appt.location?.title ?? null,
		address: isOnline ? null : joinAddress(appt.location) ?? appt.location?.address ?? null,
		color: appt.product?.color ?? null,
		bookAgainHref: bookAgain(classKeyForSlug(slug)),
	};
}

function bookAgain(classKey: string | null): string | null {
	if (!classKey) return '/timetable';
	if (classKey === 'private') return '/privates';
	if (classKey.startsWith('workshop-')) return '/workshops';
	return `/timetable?class=${encodeURIComponent(classKey)}`;
}

export type JoinState = 'early' | 'open' | 'ended';

/**
 * Whether the "Join class" button is live: from `joinWindowMinutes` before the
 * start until the class ends.
 */
export function getJoinState(from: string, to: string, now: number = Date.now()): JoinState {
	const opensAt = Date.parse(from) - siteConfig.joinWindowMinutes * 60_000;
	if (now < opensAt) return 'early';
	if (now > Date.parse(to)) return 'ended';
	return 'open';
}
