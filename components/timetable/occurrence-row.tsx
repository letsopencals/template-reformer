import Link from 'next/link';
import { clsx } from 'clsx';
import type { Occurrence } from '@/lib/timetable';
import { timetableHref } from '@/lib/timetable-url';
import { formatLocalDate, pricePreview } from '@/lib/class-sheet';
import { BedPips } from '@/components/motifs/bed-pips';
import { SpringChip } from '@/components/motifs/spring-chip';
import { Tag } from '@/components/ui/chip';
import { classShort, durationMinutes, instructorFromTitle, money, placeLabel } from './labels';

export interface OccurrenceRowProps {
	occurrence: Occurrence;
	/** For a Full class: the next one of the same class with a free bed. */
	next?: Occurrence | null;
	/** Defaults to the first name in the variant title ("Mitte · Lena"). */
	instructorName?: string;
	/** Defaults to the class-sheet deep link. */
	href?: string;
	/** Client only: open the sheet in place instead of navigating. */
	onOpen?: (o: Occurrence) => void;
	/** Prefix the date (lists that span several days). */
	showDate?: boolean;
	/** Scroll to the top on navigation. Default: true for plain links, false with `onOpen`. */
	scroll?: boolean;
	className?: string;
}

/**
 * One class in a list: time, class + spring, teacher, studio and room, bed
 * pips, off-peak price. Full rows point to the next class with space. Safe in
 * Server Components (without `onOpen`); P1/P4 import it for studio, class and
 * instructor pages.
 */
export function OccurrenceRow({ occurrence: o, next, instructorName, href, onOpen, showDate = false, scroll, className }: OccurrenceRowProps) {
	const scrollOnNav = scroll ?? !onOpen;
	const full = o.status === 'full';
	const price = pricePreview(o);
	const teacher = instructorName ?? instructorFromTitle(o);
	const label = `${classShort(o)}, ${showDate ? `${formatLocalDate(o.localDate)} ` : ''}${o.localTime} with ${teacher}, ${placeLabel(o)}. ${full ? 'Full' : `${o.seatsLeft} beds left`}`;
	const open = onOpen
		? (target: Occurrence) => (e: React.MouseEvent) => {
				if (e.metaKey || e.ctrlKey || e.shiftKey) return;
				e.preventDefault();
				onOpen(target);
			}
		: null;

	return (
		<li className={clsx('group relative grid grid-cols-[4.25rem_1fr] gap-x-4 gap-y-3 py-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center', className)}>
			<Link
				href={href ?? timetableHref({ occ: o })}
				onClick={open ? open(o) : undefined}
				scroll={scrollOnNav}
				aria-label={label}
				className="absolute inset-0 -mx-3 rounded-[2px] transition-colors duration-200 group-hover:bg-plaster-deep/60 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink"
			/>
			<div className="pointer-events-none relative">
				{showDate ? <p className="eyebrow text-steel">{formatLocalDate(o.localDate)}</p> : null}
				<p className={clsx('tabular text-[1.35rem] leading-none tracking-[-0.02em]', full ? 'text-steel' : 'text-ink')}>{o.localTime}</p>
				<p className="tabular mt-1.5 text-[0.7rem] text-steel">{durationMinutes(o)} min</p>
			</div>
			<div className="pointer-events-none relative min-w-0">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<h3 className={clsx('headline text-[1.08rem] leading-tight', full ? 'text-graphite' : 'text-ink')}>{classShort(o)}</h3>
					<SpringChip spring={o.spring} className="text-graphite" />
				</div>
				<p className="mt-1 truncate text-sm text-graphite">
					{teacher ? `${teacher} · ` : ''}
					{placeLabel(o)}
				</p>
			</div>
			<div className="relative col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-start-3 sm:flex-col sm:items-end">
				<BedPips capacity={o.capacity} seatsLeft={o.seatsLeft} className="pointer-events-none" />
				{full ? (
					<NextLink next={next ?? null} scroll={scrollOnNav} onClick={open && next ? open(next) : undefined} />
				) : (
					<PriceLine price={o.price} offPeak={price.offPeak} />
				)}
			</div>
		</li>
	);
}

function PriceLine({ price, offPeak }: { price: number; offPeak: number | null }) {
	return (
		<span className="pointer-events-none flex items-center gap-2">
			{offPeak !== null ? <Tag tone="outline">Off-peak {money(offPeak)}</Tag> : null}
			<span className={clsx('tabular text-sm', offPeak !== null ? 'text-steel line-through' : 'text-ink')}>{money(price)}</span>
		</span>
	);
}

function NextLink({ next, scroll, onClick }: { next: Occurrence | null; scroll: boolean; onClick?: (e: React.MouseEvent) => void }) {
	if (!next) return <span className="pointer-events-none text-xs text-steel">No space this window</span>;
	return (
		<Link
			href={timetableHref({ occ: next })}
			onClick={onClick}
			scroll={scroll}
			className="relative z-10 text-xs font-medium text-ink link-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
		>
			Next with space: {formatLocalDate(next.localDate)} {next.localTime} <span aria-hidden>→</span>
		</Link>
	);
}
