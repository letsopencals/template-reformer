import type { Occurrence } from '@/lib/timetable';
import { OccurrenceRow } from './occurrence-row';

/**
 * Server-rendered stand-in while the interactive timetable hydrates (and for
 * crawlers): the next classes as plain rows, each a deep link to its sheet.
 */
export function TimetableFallback({ occurrences }: { occurrences: Occurrence[] }) {
	const first = occurrences.slice(0, 24);
	if (first.length === 0) return null;
	return (
		<div className="mt-8">
			<p className="eyebrow border-b border-ink pb-2 text-ink">Coming up</p>
			<ul className="divide-y divide-line">
				{first.map((o) => (
					<OccurrenceRow key={o.key} occurrence={o} showDate />
				))}
			</ul>
		</div>
	);
}
