/**
 * Test-only builders for SDK-shaped data. Imported by `*.test.ts` files only.
 */
import type {
	CurrentAvailabilitySlot,
	LocationDetailResponse,
	ProductCollectionResponse,
	ProductListItemResponse,
	ProductListVariant,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import type { ClassSeries } from '@/lib/catalog';

type Loc = { id: string; slug: string; title: string; type: 'physical' | 'online' };
type Staff = { id: string; slug: string; firstName: string; lastName: string };

export const LOC: Record<string, Loc> = {
	mitte: { id: 'loc-mitte', slug: 'tensile-mitte', title: 'Tensile Mitte', type: 'physical' },
	kreuzberg: { id: 'loc-kreuzberg', slug: 'tensile-kreuzberg', title: 'Tensile Kreuzberg', type: 'physical' },
	pb: { id: 'loc-prenzlauer-berg', slug: 'tensile-prenzlauer-berg', title: 'Tensile Prenzlauer Berg', type: 'physical' },
	online: { id: 'loc-online', slug: 'tensile-at-home', title: 'Tensile at Home', type: 'online' },
};

export const STAFF: Record<string, Staff> = {
	lena: { id: 'staff-lena', slug: 'lena-hoffmann', firstName: 'Lena', lastName: 'Hoffmann' },
	jonas: { id: 'staff-jonas', slug: 'jonas-weber', firstName: 'Jonas', lastName: 'Weber' },
	mika: { id: 'staff-mika', slug: 'mika-tanaka', firstName: 'Mika', lastName: 'Tanaka' },
	elif: { id: 'staff-elif', slug: 'elif-yilmaz', firstName: 'Elif', lastName: 'Yılmaz' },
};

export function variant(o: {
	id: string;
	slug: string;
	productId: string;
	title: string;
	variantTitle: string;
	price: number;
	duration: number;
	maxAttendees: number;
	loc: Loc;
	staff: Staff[];
	color?: ProductListVariant['color'];
}): ProductListVariant {
	return {
		id: o.id,
		productId: o.productId,
		storeId: 'store',
		slug: o.slug,
		scheduleId: 'sch',
		productPoolId: null,
		title: o.title,
		variantTitle: o.variantTitle,
		description: '',
		imageId: '',
		color: o.color ?? 'yellow',
		price: o.price,
		duration: o.duration,
		maxAttendees: o.maxAttendees,
		status: 'active',
		image: null,
		staffMembers: o.staff.map((s) => ({ ...s, storeId: 'store', scheduleId: 'sch', imageId: '', image: null, locations: [] })),
		locations: [
			{
				...o.loc,
				storeId: 'store',
				scheduleId: null,
				description: null,
				link: null,
				addressLine1: null,
				addressLine2: null,
				city: null,
				state: null,
				postalCode: null,
				country: null,
				addressPlaceId: null,
				latitude: null,
				longitude: null,
				address: null,
				staffMembers: [],
			},
		],
		schedule: null,
		images: [],
		collections: [],
		productPool: null,
	} as unknown as ProductListVariant;
}

export function group(productId: string, title: string, variants: ProductListVariant[], extra: Partial<ProductListItemResponse> = {}): ProductListItemResponse {
	const first = variants[0]!;
	return {
		id: first.id,
		productId,
		slug: first.slug,
		title,
		variantTitle: first.variantTitle,
		description: `${title} description`,
		imageId: '',
		color: first.color,
		price: first.price,
		duration: first.duration,
		maxAttendees: first.maxAttendees,
		advanceScheduleThreshold: 0,
		cancelGap: 43200,
		variants,
		...extra,
	} as ProductListItemResponse;
}

export function location(l: Loc): LocationDetailResponse {
	return { ...l, link: l.type === 'online' ? 'https://meet.example/live' : null, products: [], staffMembers: [], availabilities: [] } as unknown as LocationDetailResponse;
}

export function staffMember(s: Staff, locs: Loc[], productIds: string[] = []): StaffMemberListItemResponse {
	return {
		...s,
		storeId: 'store',
		scheduleId: 'sch',
		imageId: '',
		image: null,
		schedule: null,
		products: productIds.map((id) => ({ id, productId: id })),
		locations: locs,
	} as unknown as StaffMemberListItemResponse;
}

export function collection(slug: string, productIds: string[]): ProductCollectionResponse {
	return {
		id: `col-${slug}`,
		storeId: 'store',
		title: slug,
		description: '',
		slug,
		isVisible: true,
		products: productIds.map((id) => ({ id, productId: id })),
	} as unknown as ProductCollectionResponse;
}

/** A merged-availability range from a UTC start ISO string and a length in minutes. */
export function slot(startIso: string, minutes: number, attendees = 0, maxAttendees = 12): CurrentAvailabilitySlot {
	const start = new Date(startIso);
	const end = new Date(start.getTime() + minutes * 60_000);
	const d = (x: Date) => x.toISOString().slice(0, 10);
	const t = (x: Date) => x.toISOString().slice(11, 19);
	return { productId: 'p', fromDate: d(start), fromTime: t(start), toDate: d(end), toTime: t(end), attendees, maxAttendees, staffMemberIds: null, locationIds: null };
}

export function series(o: Partial<ClassSeries> & Pick<ClassSeries, 'id' | 'classKey'>): ClassSeries {
	return {
		slug: o.id,
		productId: `group-${o.classKey}`,
		kind: 'class',
		title: o.classKey,
		variantTitle: 'Mitte · Lena',
		studio: { id: 'loc-mitte', slug: 'tensile-mitte', key: 'mitte', name: 'Tensile Mitte', short: 'Mitte', online: false },
		instructor: { id: 'staff-lena', slug: 'lena-hoffmann', name: 'Lena Hoffmann', firstName: 'Lena', image: null },
		instructors: [],
		capacity: 12,
		price: 34,
		duration: 50 * 60,
		spring: 'yellow',
		color: 'yellow',
		images: [],
		room: null,
		privateFormat: null,
		advanceThreshold: 0,
		cancelGap: 43200,
		...o,
	};
}
