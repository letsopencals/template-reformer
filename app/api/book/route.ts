import '@/lib/opencals';
import {
	AppointmentService,
	CartService,
	type AppointmentDateRangeSlot,
	type CheckoutQuestionAnswer,
	type CreateAppointmentAddOn,
	type ExistingOrderCustomer,
	type NewOrderCustomer,
} from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { sanitizeAddOns, sanitizePeople } from '@/app/api/_lib/guards';
import { siteConfig } from '@/lib/site-config';
import { publicPayload } from '@/lib/public-payload';

/** Either checkout customer shape, flattened: `kind` says which one it is. */
type CustomerInput = { kind?: ExistingOrderCustomer['kind'] | NewOrderCustomer['kind'] } & Partial<Pick<ExistingOrderCustomer, 'customerId'>> &
	Partial<Pick<NewOrderCustomer, 'email' | 'firstName' | 'lastName'>>;

export async function POST(request: NextRequest) {
	const cartIdHeader = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const { slot, numberOfAttendees, addOns, customer, checkoutQuestionAnswers, people } = body as {
			slot: AppointmentDateRangeSlot;
			numberOfAttendees?: number;
			addOns?: CreateAppointmentAddOn[];
			customer?: CustomerInput;
			checkoutQuestionAnswers?: CheckoutQuestionAnswer[];
			/** Privates: "2" for a duet. Sent as appointment customAttributes.people. */
			people?: unknown;
		};

		if (!slot?.productId || !slot?.fromDate || !slot?.fromTime || !slot?.toDate || !slot?.toTime) {
			return NextResponse.json({ error: 'Invalid slot data' }, { status: 400 });
		}

		const token = await getAccessToken();
		const authHeaders = { Authorization: `Bearer ${token ?? ''}` };

		const { data: cart } = await CartService.createOrGet({
			headers: { ...authHeaders, 'X-Cart-Id': cartIdHeader },
			throwOnError: true,
		});

		const { data: appointment } = await AppointmentService.create({
			body: {
				slot: {
					productId: slot.productId,
					fromDate: slot.fromDate,
					fromTime: slot.fromTime,
					toDate: slot.toDate,
					toTime: slot.toTime,
					staffMemberId: slot.staffMemberId ?? null,
					locationId: slot.locationId ?? null,
				},
				// A duet is ONE seat (one private room) for two people; the head count travels as an attribute.
				numberOfAttendees: typeof numberOfAttendees === 'number' && numberOfAttendees >= 1 ? Math.min(20, Math.trunc(numberOfAttendees)) : 1,
				cartId: cart.id,
				addOns: sanitizeAddOns(addOns),
				...(people !== undefined ? { customAttributes: { [siteConfig.customAttributeKeys.people]: sanitizePeople(people) } } : {}),
				...(customer
				? {
						customer:
							customer.kind === 'existing' && customer.customerId
								? { customerId: customer.customerId }
								: { externalId: customer.email ?? '', email: customer.email ?? '', firstName: customer.firstName, lastName: customer.lastName },
					}
				: {}),
				...(checkoutQuestionAnswers && checkoutQuestionAnswers.length > 0
					? { checkoutQuestionAnswers }
					: {}),
			},
			headers: authHeaders,
			throwOnError: true,
		});

		const { data: finalCart } = await CartService.get({
			headers: { ...authHeaders, 'X-Cart-Id': cart.id },
			throwOnError: true,
		});

		return NextResponse.json(publicPayload({ appointment, cart: finalCart }));
	} catch (err) {
		return handleApiError(err);
	}
}
