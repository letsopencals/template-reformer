import Link from 'next/link';
import { BedPips, placesLeft, placeUnit } from '@/components/motifs/bed-pips';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { Tag } from '@/components/ui/chip';
import { siteConfig } from '@/lib/site-config';
import type { Occurrence } from '@/lib/timetable';
import { timetableHref } from '@/lib/timetable-url';
import { occurrenceHref, type BoardRow as BoardRowData } from '@/components/home/board-logic';

export interface BoardRowLabels {
	where: string;
	teacher: string | null;
	/** "Wed 18:00 · Kreuzberg" for a Full row's next class with space. */
	next: string | null;
}

const GRID =
	'grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-4 py-5 sm:px-6 lg:grid-cols-[6rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_9.5rem_8rem] lg:items-center lg:gap-x-6';

/** One departure on the "Today at Tensile" board. Open rows link to the class sheet. */
export function BoardRow({ row, labels }: { row: BoardRowData; labels: BoardRowLabels }) {
	const o = row.occurrence;
	const full = o.status === 'full';
	const body = (
		<>
			<p className="row-span-2 lg:row-span-1">
				<span className="tabular block text-2xl leading-none font-medium text-ink lg:text-[1.7rem]">{o.localTime}</span>
				<span className="eyebrow mt-2 block text-steel">{row.dayLabel}</span>
			</p>
			<div className="min-w-0">
				<p className="flex items-center gap-2.5">
					<SpringCoil spring={o.spring} className="h-3.5" />
					<span className={`headline truncate text-lg ${full ? 'text-graphite' : 'text-ink'}`}>{o.title}</span>
				</p>
				<p className="mt-1.5 flex flex-wrap items-center gap-1.5">
					<span className="eyebrow text-steel">{o.level}</span>
					{o.offPeak ? <Tag tone="neutral">{siteConfig.offPeak.label}</Tag> : null}
					{o.kind === 'online' ? <Tag tone="outline">Live online</Tag> : null}
				</p>
			</div>
			<p className="col-start-2 text-[0.92rem] text-graphite lg:col-start-auto">
				{labels.where}
				{labels.teacher ? <span className="lg:hidden"> · {labels.teacher}</span> : null}
			</p>
			<p className="text-[0.92rem] text-graphite max-lg:hidden">{labels.teacher ?? ''}</p>
			<div className="col-start-2 flex items-center justify-between gap-4 lg:contents">
				<BedPips capacity={o.capacity} seatsLeft={full ? 0 : o.seatsLeft} max={12} unit={placeUnit(o)} />
				<RowAction occurrence={o} next={row.next} nextLabel={labels.next} />
			</div>
		</>
	);

	if (full) return <li className={`${GRID} bg-plaster-deep/40`}>{body}</li>;
	return (
		<li>
			<Link
				href={occurrenceHref(o)}
				aria-label={`${o.title}, ${row.dayLabel} ${o.localTime}, ${labels.where}. ${placesLeft(o.seatsLeft, placeUnit(o))}. Open in the timetable.`}
				className={`${GRID} group transition-colors duration-300 hover:bg-plaster-deep focus-visible:bg-plaster-deep focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink`}
			>
				{body}
			</Link>
		</li>
	);
}

function RowAction({ occurrence, next, nextLabel }: { occurrence: Occurrence; next: Occurrence | null; nextLabel: string | null }) {
	if (occurrence.status !== 'full') {
		return (
			<span aria-hidden className="eyebrow inline-flex items-center gap-2 justify-self-end text-ink">
				Hold a bed
				<span className="transition-transform duration-500 ease-[var(--ease-carriage)] group-hover:translate-x-1.5">→</span>
			</span>
		);
	}
	if (!next || !nextLabel) {
		return (
			<Link
				href={timetableHref({ class: occurrence.classKey })}
				className="eyebrow justify-self-end text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
			>
				Other times <span aria-hidden>→</span>
			</Link>
		);
	}
	return (
		<Link
			href={occurrenceHref(next)}
			className="group/next eyebrow inline-flex flex-col items-end gap-1 justify-self-end text-right text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
		>
			<span className="text-steel">Next with space</span>
			<span>
				{nextLabel} <span aria-hidden>→</span>
			</span>
		</Link>
	);
}
