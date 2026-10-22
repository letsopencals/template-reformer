import { RoomPlan } from '@/components/motifs/room-plan';
import { SPRING_VAR } from '@/components/motifs/spring-chip';
import { JoinButton } from '@/components/account/join-button';
import { siteConfig } from '@/lib/site-config';
import type { BookingView } from '@/components/account/booking-view';
import { bedIndexFor } from '@/components/confirmation/pass-helpers';

/**
 * The right half of the check-in pass: the room drawn from above with "your
 * spot" outlined in the class's spring colour, or the live-online panel. Beds
 * aren't assigned, so the caption never names a bed number.
 */
export function PassRoom({ view }: { view: BookingView }) {
	if (view.isOnline) {
		return (
			<div className="flex h-full flex-col justify-between gap-6 bg-ink p-6 text-paper sm:p-8">
				<div>
					<p className="eyebrow text-paper/50">{siteConfig.studios['tensile-at-home'].name}</p>
					<p className="headline mt-3 text-xl">Live, with a teacher who can see you.</p>
					<p className="mt-3 text-sm leading-relaxed text-paper/70">
						The link opens here and in your account {siteConfig.joinWindowMinutes} minutes before class. Camera on, a mat and a bit of floor.
					</p>
				</div>
				{view.joinUrl ? <JoinButton joinUrl={view.joinUrl} from={view.startIso} to={view.endIso} size="md" /> : <p className="eyebrow text-paper/50">Link coming by email</p>}
			</div>
		);
	}

	if (!view.room) {
		return (
			<div className="flex h-full items-center justify-center bg-plaster-deep p-8">
				<p className="eyebrow max-w-[16rem] text-center text-graphite">Your spot is held. We’ll set up your reformer before you arrive.</p>
			</div>
		);
	}

	const highlight = bedIndexFor(view.id, Math.min(view.room.beds, view.room.layout.rows * view.room.layout.cols));
	return (
		<figure className="flex h-full flex-col justify-between gap-5 bg-plaster-deep/60 p-6 sm:p-8">
			<figcaption className="flex items-center justify-between gap-3">
				<span className="eyebrow text-graphite">{view.room.name}</span>
				<span className="eyebrow flex items-center gap-2 text-ink">
					<span aria-hidden className="h-2.5 w-2.5 rounded-[1px] border-2" style={{ borderColor: SPRING_VAR[view.spring] }} />
					Your spot is held
				</span>
			</figcaption>
			<div className="mx-auto w-full max-w-[360px]">
				<RoomPlan room={view.room} highlight={highlight} highlightColor={SPRING_VAR[view.spring]} />
			</div>
			<p className="text-xs leading-relaxed text-graphite">
				{view.room.beds} {view.room.equipment === 'mat' ? 'mats' : view.room.equipment === 'tower' ? 'towers' : 'reformers'} in the room, one of them yours. Arrive ten minutes early and your teacher sets the springs with you.
			</p>
		</figure>
	);
}
