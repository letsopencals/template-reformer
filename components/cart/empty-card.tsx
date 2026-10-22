import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { RoomPlan } from '@/components/motifs/room-plan';

const EMPTY_ROOM = { name: 'Courtyard Room', beds: 8, layout: { rows: 2, cols: 4 }, equipment: 'reformer' } as const;

/** Empty state for the drawer (and /checkout with no cart): an empty room plan. */
export function EmptyCard({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
	return (
		<div className={className ?? 'flex h-full flex-col items-center justify-center py-10 text-center'}>
			<div className="w-44 opacity-80">
				<RoomPlan room={EMPTY_ROOM} showLabels={false} />
			</div>
			<p className="eyebrow mt-8 text-graphite">Nothing held yet</p>
			<h3 className="display-sm mt-3 text-ink">
				No beds <em>held</em>
			</h3>
			<p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-graphite">
				Pick a class from the timetable. We&rsquo;ll hold your bed while you check out.
			</p>
			<Link href="/timetable" onClick={onNavigate} className={buttonClasses({ variant: 'outline', size: 'md', className: 'mt-7' })}>
				Open the timetable
			</Link>
		</div>
	);
}
