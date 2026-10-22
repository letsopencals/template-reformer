import Link from 'next/link';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { RoomPlan } from '@/components/motifs/room-plan';
import { Reveal } from '@/components/motion/reveal';
import type { ClassType } from '@/lib/catalog';
import type { RoomMeta } from '@/lib/site-config';
import { classesInRoom, equipmentLabel } from './rooms';

/**
 * Every room at a studio, drawn as a plan from `siteConfig.studios[*].rooms`
 * (rows × cols), with the bed count and the classes held there.
 */
export function StudioRooms({ rooms, studioKey, classTypes }: { rooms: RoomMeta[]; studioKey: string; classTypes: ClassType[] }) {
	return (
		<ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{rooms.map((room, i) => {
				const classes = room.private ? [] : classesInRoom(classTypes, studioKey, room.key);
				return (
					<Reveal as="li" key={room.key} delay={Math.min(i, 3) * 0.06} className="flex flex-col rounded-[4px] border border-line bg-paper p-5">
						<div className="flex items-baseline justify-between gap-3">
							<h3 className="headline text-xl text-ink">{room.name}</h3>
							<span className="tabular text-sm text-graphite">
								{room.private ? '1:1 or duet' : `${room.beds} ${equipmentLabel(room.equipment, room.beds)}`}
							</span>
						</div>
						<div className="mt-5 flex flex-1 items-center">
							<RoomPlan room={room} className={room.private ? 'mx-auto max-w-[9rem]' : undefined} />
						</div>
						<div className="mt-5 border-t border-line pt-4">
							{room.private ? (
								<Link href={`/privates?studio=${studioKey}`} className="eyebrow link-underline text-ink focus-visible:outline-2 focus-visible:outline-ink">
									Book a private →
								</Link>
							) : classes.length ? (
								<ul className="flex flex-wrap gap-x-4 gap-y-2">
									{classes.map((c) => (
										<li key={c.key}>
											<Link
												href={`/classes/${c.key}`}
												className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.08em] text-ink uppercase hover:underline focus-visible:outline-2 focus-visible:outline-ink"
											>
												<SpringCoil spring={c.spring} className="h-2.5" coils={4} />
												{c.meta?.short ?? c.title}
											</Link>
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-steel">No classes scheduled here yet.</p>
							)}
						</div>
					</Reveal>
				);
			})}
		</ul>
	);
}
