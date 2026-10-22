'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { AccountHeading } from '@/components/account/account-heading';
import { AccountError } from '@/components/account/account-states';
import { shortTitle, toBookingView } from '@/components/account/booking-view';
import { BOOKINGS_KEY } from '@/components/account/use-bookings';
import { CheckInPass } from '@/components/confirmation/check-in-pass';
import { PassSkeleton } from '@/components/confirmation/pass-skeleton';
import { DetailActions } from '@/components/account/appointment-detail/detail-actions';

export type DetailAction = 'cancel' | 'reschedule' | 'feedback';

const SWR_OPTS = { revalidateOnFocus: false } as const;

/**
 * One booking as its check-in pass, with the actions that fit its state.
 * Magic links land here with `?action=cancel|reschedule|feedback`: the matching
 * dialog opens once and the query is stripped.
 */
export function AppointmentDetailView({ id, initialAction }: { id: string; initialAction: DetailAction | null }) {
	const router = useRouter();
	const pathname = usePathname();
	const { mutate: mutateGlobal } = useSWRConfig();
	const key = `/api/account/appointments/${encodeURIComponent(id)}`;
	const { data, error, isLoading, mutate } = useSWR<AppointmentDetailResponse>(key, fetcher, SWR_OPTS);
	const view = useMemo(() => (data ? toBookingView(data) : null), [data]);
	const now = useNow(60_000);
	const [action] = useState(initialAction);

	useEffect(() => {
		if (initialAction) router.replace(pathname, { scroll: false });
	}, [initialAction, pathname, router]);

	const refresh = () => {
		void mutate();
		void mutateGlobal(BOOKINGS_KEY);
	};

	return (
		<div className="container-x">
			<AccountHeading
				eyebrow={data?.name ? `Booking ${data.name}` : 'Booking'}
				title={view ? shortTitle(view) : 'Your booking'}
				aside={
					<Link href="/account" className="link-underline text-sm text-ink">
						<span aria-hidden>←</span> Your week
					</Link>
				}
			/>
			{error && !data ? (
				<AccountError what="this booking" onRetry={() => void mutate()} />
			) : isLoading || !view || !data ? (
				<PassSkeleton label="Loading your booking" />
			) : (
				<CheckInPass view={view} showNextWeek={view.end > (now?.getTime() ?? 0)}>
					<DetailActions view={view} detail={data} now={now?.getTime() ?? null} initial={action} onChanged={refresh} />
				</CheckInPass>
			)}
		</div>
	);
}
