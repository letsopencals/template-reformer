import { clsx } from 'clsx';
import { SpringChip } from '@/components/motifs/spring-chip';
import { Tag } from '@/components/ui/chip';
import { classMeta } from '@/lib/site-config';
import type { BookingView } from '@/components/account/booking-view';
import { Countdown } from '@/components/confirmation/countdown';
import { PassRoom } from '@/components/confirmation/pass-room';
import { PassFooter } from '@/components/confirmation/pass-footer';

export interface CheckInPassProps {
	view: BookingView;
	/** 0-based; with `total > 1` prints "Nº 01 / 03". */
	index?: number;
	total?: number;
	/** Hide "Same time next week?" (e.g. on a cancelled booking). */
	showNextWeek?: boolean;
	/** Action row (account detail: move, cancel, feedback). */
	children?: React.ReactNode;
	className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The check-in pass: a printed ticket for one booking. Big mono start time,
 * class with its spring, teacher, studio and room, the room plan with your
 * spot held, then what to bring, directions and calendar links.
 */
export function CheckInPass({ view, index = 0, total = 1, showNextWeek = true, children, className }: CheckInPassProps) {
	const level = classMeta(view.classKey)?.level ?? null;
	const cancelled = view.status === 'canceled';
	return (
		<article aria-label={`${view.title}, ${view.dayLabel} at ${view.time}`} className={clsx('overflow-hidden rounded-[4px] border border-line bg-paper shadow-card', className)}>
			<div className="grid md:grid-cols-[1.1fr_1fr]">
				<div className="flex flex-col p-6 sm:p-8">
					<div className="flex items-center justify-between gap-3">
						<p className="eyebrow text-steel">
							Check-in pass{total > 1 ? ` · Nº ${pad(index + 1)} / ${pad(total)}` : ''}
						</p>
						{cancelled ? <Tag tone="red">Cancelled</Tag> : <Tag tone="ink">{view.kindLabel}</Tag>}
					</div>

					<p className={clsx('tabular mt-6 text-[clamp(3.6rem,13vw,6.75rem)] leading-[0.9] font-medium tracking-[-0.05em] text-ink', cancelled && 'text-steel line-through decoration-2')}>
						{view.time}
					</p>
					<p className="tabular mt-3 text-[0.95rem] text-ink">
						{view.dayLabel} · {view.time}–{view.endTime} · {view.minutes} min
					</p>
					{cancelled ? null : <Countdown start={view.start} end={view.end} className="mt-2" />}

					<span aria-hidden className="cable mt-6 opacity-30" />

					<h2 className="headline mt-6 text-[1.6rem] leading-tight text-ink">{view.title}</h2>
					<div className="mt-3 flex flex-wrap items-center gap-3">
						<SpringChip spring={view.spring} />
						{level ? <span className="eyebrow text-graphite">{level}</span> : null}
					</div>

					<dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
						<PassFact label="Teacher" value={view.teacher} />
						<PassFact label="Studio" value={view.studio?.short ?? view.locationTitle} />
						<PassFact label="Room" value={view.isOnline ? 'Your living room' : view.room?.name ?? null} />
						<PassFact label="People" value={view.people > 1 ? `${view.people} (duet)` : null} />
					</dl>
				</div>
				<PassRoom view={view} />
			</div>

			<div aria-hidden className="perforation h-px" />
			<PassFooter view={view} showNextWeek={showNextWeek && !cancelled} />
			{children ? <div className="border-t border-line px-6 py-5 sm:px-8">{children}</div> : null}
		</article>
	);
}

function PassFact({ label, value }: { label: string; value: string | null }) {
	if (!value) return null;
	return (
		<div>
			<dt className="eyebrow text-steel">{label}</dt>
			<dd className="mt-1 text-ink">{value}</dd>
		</div>
	);
}
