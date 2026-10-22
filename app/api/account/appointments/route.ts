import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

const STATUSES = ['pending', 'scheduled', 'completed', 'canceled'] as const;
type AppointmentStatus = (typeof STATUSES)[number];

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	const { searchParams } = request.nextUrl;
	const take = searchParams.get('take') ?? '20';
	const page = searchParams.get('page') ?? '1';
	const status = searchParams.getAll('status').filter((s): s is AppointmentStatus => STATUSES.includes(s as AppointmentStatus));
	const orderBy = searchParams.get('orderBy') === 'from' ? 'from' : undefined;
	const order = searchParams.get('order') === 'ASC' ? 'ASC' : searchParams.get('order') === 'DESC' ? 'DESC' : undefined;

	try {
		const { data } = await AppointmentService.list({
			query: {
				take: Number(take),
				page: Number(page),
				...(status.length ? { status } : {}),
				...(orderBy ? { orderBy } : {}),
				...(order ? { order } : {}),
			},
			headers: auth.headers,
		});
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}
