import { RoomPlan } from '@/components/motifs/room-plan';
import type { RoomMeta } from '@/lib/site-config';
import type { Occurrence } from '@/lib/timetable';

/** The room drawn bed by bed: taken in ink, free outlined. Counts only, no seat choice. */
export function RoomBlock({ occurrence: o, room }: { occurrence: Occurrence; room: RoomMeta | null }) {
	const taken = Math.max(0, o.capacity - o.seatsLeft);
	const full = o.status === 'full';
	if (o.kind === 'online' || !room) {
		return (
			<section className="mt-8 border border-line px-4 py-4">
				<p className="eyebrow text-graphite">{o.kind === 'online' ? 'Live online' : 'The room'}</p>
				<p className="mt-1.5 text-sm text-ink">
					{full ? 'Every place is taken.' : `${o.seatsLeft} of ${o.capacity} places free.`}
					{o.kind === 'online' ? ' The join link arrives with your confirmation and opens in your account 10 minutes before.' : ''}
				</p>
			</section>
		);
	}
	const plan = { ...room, beds: o.capacity };
	return (
		<section className="mt-8" aria-label={`${room.name}: ${taken} of ${o.capacity} beds taken`}>
			<div className="flex items-baseline justify-between gap-4">
				<p className="eyebrow text-graphite">{room.name}</p>
				<p className={`tabular text-xs ${full || o.status === 'low' ? 'text-spring-red' : 'text-graphite'}`}>
					{full ? 'Full' : `${o.seatsLeft} free · ${taken} taken`}
				</p>
			</div>
			<div className="mt-3 border border-line bg-plaster/60 p-3 sm:p-4">
				<RoomPlan room={plan} taken={taken} className="mx-auto max-h-64" />
			</div>
			<p className="mt-2 text-xs text-steel">Beds are set up when you arrive; pick any free one.</p>
		</section>
	);
}
