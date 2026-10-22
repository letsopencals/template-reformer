import Link from 'next/link';
import { clsx } from 'clsx';
import type { Occurrence } from '@/lib/timetable';
import { timetableHref } from '@/lib/timetable-url';
import { formatLocalDate, pricePreview } from '@/lib/class-sheet';
import { BedPips } from '@/components/motifs/bed-pips';
import { SPRING_VAR } from '@/components/motifs/spring-chip';
import { classShort, instructorFromTitle, money, placeLabel } from './labels';

/**
 * A class on the desktop week poster: a typographic card with a spring rail
 * on the left edge. Full classes dim and point to the next one with space.
 */
export function OccurrenceTile({
	occurrence: o,
	next,
	instructorName,
	onOpen,
}: {
	occurrence: Occurrence;
	next: Occurrence | null;
	instructorName?: string;
	onOpen: (o: Occurrence) => void;
}) {
	const full = o.status === 'full';
	const offPeak = pricePreview(o).offPeak;
	const teacher = instructorName ?? instructorFromTitle(o);
	const handle = (target: Occurrence) => (e: React.MouseEvent) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey) return;
		e.preventDefault();
		onOpen(target);
	};

	return (
		<li className="group relative">
			<Link
				href={timetableHref({ occ: o })}
				onClick={handle(o)}
				scroll={false}
				aria-label={`${classShort(o)} ${o.localTime} with ${teacher}, ${placeLabel(o)}. ${full ? 'Full' : `${o.seatsLeft} beds left`}`}
				className={clsx(
					'block border-l-2 bg-paper py-2.5 pr-2.5 pl-3 transition-[background-color,transform] duration-300 ease-[var(--ease-carriage)] hover:-translate-y-px hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
					full ? 'opacity-70' : null,
				)}
				style={{ borderLeftColor: SPRING_VAR[o.spring] }}
			>
				<span className="flex items-baseline justify-between gap-2">
					<span className={clsx('tabular text-[1.05rem] leading-none', full ? 'text-steel' : 'text-ink')}>{o.localTime}</span>
					{offPeak !== null ? <span className="eyebrow text-[0.58rem] text-graphite">Off-peak</span> : null}
				</span>
				<span className="headline mt-1.5 block truncate text-[0.92rem] leading-tight text-ink">{classShort(o)}</span>
				<span className="mt-0.5 block truncate text-[0.75rem] text-graphite">
					{teacher ? `${teacher} · ` : ''}
					{placeLabel(o)}
				</span>
				<span className="mt-2 flex items-center justify-between gap-2">
					<BedPips capacity={o.capacity} seatsLeft={o.seatsLeft} max={12} showLabel={false} />
					<span className={clsx('tabular text-[0.68rem]', full || o.status === 'low' ? 'text-spring-red' : 'text-graphite')}>
						{full ? 'Full' : `${o.seatsLeft} left`}
						{!full && offPeak !== null ? ` · ${money(offPeak)}` : ''}
					</span>
				</span>
			</Link>
			{full && next ? (
				<Link
					href={timetableHref({ occ: next })}
					onClick={handle(next)}
					scroll={false}
					className="mt-1 block truncate pl-3 text-[0.68rem] text-ink link-underline focus-visible:outline-2 focus-visible:outline-ink"
				>
					Next: {next.localDate === o.localDate ? '' : `${formatLocalDate(next.localDate).split(' ').slice(0, 2).join(' ')} `}
					{next.localTime} <span aria-hidden>→</span>
				</Link>
			) : null}
		</li>
	);
}
