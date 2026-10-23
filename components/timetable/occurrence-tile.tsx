import Link from 'next/link';
import { clsx } from 'clsx';
import type { Occurrence } from '@/lib/timetable';
import { timetableHref } from '@/lib/timetable-url';
import { formatLocalDate, pricePreview } from '@/lib/class-sheet';
import { BedPips, placesLeft, placeUnit } from '@/components/motifs/bed-pips';
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
				aria-label={`${classShort(o)} ${o.localTime} with ${teacher}, ${placeLabel(o)}. ${full ? 'Full' : placesLeft(o.seatsLeft, placeUnit(o))}`}
				className={clsx(
					'block border-l-2 bg-paper py-2.5 pr-2.5 pl-3 transition-[background-color,transform] duration-300 ease-[var(--ease-carriage)] hover:-translate-y-px hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
					full ? 'opacity-70' : null,
				)}
				style={{ borderLeftColor: SPRING_VAR[o.spring] }}
			>
				<span className="flex items-baseline justify-between gap-2">
					<span className={clsx('tabular text-[1.05rem] leading-none', full ? 'text-steel' : 'text-ink')}>{o.localTime}</span>
					{offPeak !== null ? <span className="eyebrow shrink-0 text-[0.56rem] text-graphite">Off-peak</span> : null}
				</span>
				<span className="headline mt-1.5 block text-[0.92rem] leading-tight text-ink [overflow-wrap:anywhere]">{classShort(o)}</span>
				{teacher ? <span className="mt-1 block truncate text-[0.75rem] font-medium text-ink">{teacher}</span> : null}
				<span className="line-clamp-2 block text-[0.72rem] leading-snug text-graphite">
					{placeLabel(o)}
				</span>
				<BedPips capacity={o.capacity} seatsLeft={o.seatsLeft} max={12} showLabel={false} className="mt-2.5" />
				<span className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2">
					<span className={clsx('tabular text-[0.68rem]', full || o.status === 'low' ? 'text-spring-red' : 'text-graphite')}>
						{full ? 'Full' : placesLeft(o.seatsLeft, placeUnit(o))}
					</span>
					{!full && offPeak !== null ? <span className="tabular text-[0.68rem] text-ink">{money(offPeak)}</span> : null}
				</span>
			</Link>
			{full && next ? (
				<Link
					href={timetableHref({ occ: next })}
					onClick={handle(next)}
					scroll={false}
					className="mt-1 block pl-3 text-[0.68rem] leading-snug text-ink link-underline focus-visible:outline-2 focus-visible:outline-ink"
				>
					Next: {next.localDate === o.localDate ? '' : `${formatLocalDate(next.localDate).split(' ').slice(0, 2).join(' ')} `}
					{next.localTime} <span aria-hidden>→</span>
				</Link>
			) : null}
		</li>
	);
}
