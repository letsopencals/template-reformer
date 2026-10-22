'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useNow } from '@/hooks/use-now';
import { AccountHeading } from '@/components/account/account-heading';
import { AccountError, AccountLoading, EmptyWeek } from '@/components/account/account-states';
import { studiosVisited } from '@/components/account/account-insights';
import { FeedbackPrompt, pickFeedbackTarget } from '@/components/account/feedback-prompt';
import { LevelPathCard } from '@/components/account/level-path-card';
import { PastClasses } from '@/components/account/past-classes';
import { StudiosVisited } from '@/components/account/studios-visited';
import { useBookings } from '@/components/account/use-bookings';
import { useRated } from '@/components/account/use-rated';
import { WeekBoard } from '@/components/account/week-board';

function weekIntro(count: number): string {
	if (!count) return 'Nothing on the reformer this week yet.';
	return `${count} ${count === 1 ? 'class' : 'classes'} booked. Move or cancel each one up to its cutoff, shown under the buttons.`;
}

/**
 * The account home: "Your week" board, a feedback strip after a recent class,
 * then past classes beside the level path and studios visited.
 */
export function AccountHome() {
	const { data: session } = useSession();
	const { raw, split, error, loading, mutate } = useBookings();
	const { rated, markRated } = useRated();
	const now = useNow(60_000);
	const name = session?.customer?.firstName;

	const visits = useMemo(() => studiosVisited(split?.past ?? []), [split]);
	const target = split && now ? pickFeedbackTarget(split.past, rated, now.getTime()) : null;
	const refresh = () => void mutate();

	return (
		<div className="container-x">
			<AccountHeading
				eyebrow={name ? `Welcome back, ${name}` : 'Your account'}
				title="Your week"
				intro={split ? weekIntro(split.upcoming.filter((v) => v.start - (now?.getTime() ?? 0) < 7 * 86_400_000).length) : undefined}
			/>

			{error && !split ? (
				<AccountError onRetry={refresh} />
			) : loading || !split ? (
				<AccountLoading />
			) : (
				<div className="space-y-16">
					{target ? <FeedbackPrompt target={target} onRated={markRated} /> : null}
					{split.upcoming.length ? <WeekBoard upcoming={split.upcoming} onChanged={refresh} /> : <EmptyWeek firstTime={!split.past.length} />}

					<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
						<PastClasses past={split.past} rated={rated} onRated={markRated} />
						<aside className="space-y-6">
							<LevelPathCard appointments={raw} now={now?.getTime() ?? 0} />
							<StudiosVisited visits={visits} />
						</aside>
					</div>
				</div>
			)}
		</div>
	);
}
