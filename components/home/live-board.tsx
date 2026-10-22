import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { CountUp } from '@/components/motion/count-up';
import { BoardRow, type BoardRowLabels } from '@/components/home/board-row';
import { BoardFrame } from '@/components/home/board-frame';
import { selectBoard, dayLabel } from '@/components/home/board-logic';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { localParts, type Occurrence } from '@/lib/timetable';
import { studioMetaByKey } from '@/lib/site-config';
import type { Catalog } from '@/lib/catalog';

const TITLES = { today: 'Today at Tensile', tomorrow: 'Tomorrow at Tensile', later: 'Next at Tensile' } as const;

/**
 * "Today at Tensile": the next six group classes across every studio, from the
 * five-minute timetable cache. Streams in behind <LiveBoardSkeleton>.
 */
export async function LiveBoard() {
	const [occurrences, catalog] = await Promise.all([getTimetable(), getCatalog()]);
	const now = Date.now();
	const board = selectBoard(occurrences, now);
	const today = localParts(now).date;
	const labelsFor = labeller(catalog, today);

	const stats = [
		{ value: board.classesLeftToday, label: 'Classes left today' },
		{ value: board.bedsFreeToday, label: 'Beds free today' },
		{ value: board.classesThisWeek, label: 'Classes this week' },
	].filter((s) => s.value > 0);

	return (
		<BoardFrame
			title={TITLES[board.scope]}
			stats={
				stats.length ? (
					<dl className="grid grid-cols-3 gap-4 sm:gap-8">
						{stats.map((s) => (
							<div key={s.label}>
								<dt className="eyebrow text-steel">{s.label}</dt>
								<dd className="mt-1 text-2xl font-medium text-ink">
									<CountUp value={s.value} />
								</dd>
							</div>
						))}
					</dl>
				) : null
			}
		>
			{board.rows.length ? (
				<ol className="divide-y divide-line">
					{board.rows.map((row) => (
						<BoardRow key={row.occurrence.key} row={row} labels={labelsFor(row.occurrence, row.next)} />
					))}
				</ol>
			) : (
				<div className="flex flex-col items-start gap-5 px-6 py-14 sm:px-10">
					<p className="headline text-xl text-ink">Nothing on the board right now.</p>
					<p className="max-w-md text-graphite">The next classes will show up here as soon as the timetable is published. Check the full week, or book a private.</p>
					<div className="flex flex-wrap gap-3">
						<Link href="/timetable" className={buttonClasses({ size: 'sm' })}>
							Open the timetable
						</Link>
						<Link href="/privates" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
							Book a private
						</Link>
					</div>
				</div>
			)}
		</BoardFrame>
	);
}

function labeller(catalog: Catalog, today: string) {
	const teacher = new Map(catalog.instructors.map((i) => [i.id, i.name]));
	const studioShort = new Map(catalog.studios.map((s) => [s.key, s.short]));
	const where = (o: Occurrence): string => {
		const studio = o.studioKey ? (studioShort.get(o.studioKey) ?? studioMetaByKey(o.studioKey)?.short ?? null) : null;
		const room = o.roomKey ? studioMetaByKey(o.studioKey)?.rooms.find((r) => r.key === o.roomKey)?.name : null;
		if (o.kind === 'online') return studio ?? 'Online';
		return [studio, room].filter(Boolean).join(' · ') || o.variantTitle;
	};
	return (o: Occurrence, next: Occurrence | null): BoardRowLabels => ({
		where: where(o),
		teacher: o.instructorId ? (teacher.get(o.instructorId) ?? null) : null,
		next: next ? `${dayLabel(next.localDate, today)} ${next.localTime} · ${where(next).split(' · ')[0]}` : null,
	});
}
