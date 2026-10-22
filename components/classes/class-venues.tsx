import Link from 'next/link';
import { RoomPlan } from '@/components/motifs/room-plan';
import { Reveal } from '@/components/motion/reveal';
import type { ClassType } from '@/lib/catalog';
import { formatWholePrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { EmptyState } from './empty-state';

/**
 * Where a class runs: one panel per studio with the room drawn as a plan, the
 * bed count and the teachers who take it there. Online series get a plain panel.
 */
export function ClassVenues({ classType: c }: { classType: ClassType }) {
	const byStudio = new Map<string, ClassType['series']>();
	for (const s of c.series) {
		const id = s.studio?.id ?? 'none';
		byStudio.set(id, [...(byStudio.get(id) ?? []), s]);
	}
	const venues = [...byStudio.values()].filter((list) => list[0]?.studio);
	if (!venues.length) return <EmptyState title="Studios to be announced" body="This class isn't assigned to a studio yet." />;

	return (
		<ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{venues.map((list, i) => {
				const first = list[0]!;
				const studio = first.studio!;
				const room = list.find((s) => s.room)?.room ?? null;
				const teachers = [...new Map(list.flatMap((s) => s.instructors).map((t) => [t.id, t])).values()];
				const prices = [...new Set(list.map((s) => s.price))];
				return (
					<Reveal as="li" key={studio.id} delay={Math.min(i, 3) * 0.06} className="flex flex-col rounded-[4px] border border-line bg-paper p-5">
						<div className="flex items-baseline justify-between gap-3">
							{studio.online ? (
								<p className="headline text-xl text-ink">{studio.name}</p>
							) : (
								<Link href={`/studios/${studio.key}`} className="headline link-underline text-xl text-ink focus-visible:outline-2 focus-visible:outline-ink">
									{studio.name}
								</Link>
							)}
							<span className="tabular text-sm text-graphite">{prices.length === 1 ? formatWholePrice(prices[0]!, siteConfig.currency) : null}</span>
						</div>
						<p className="eyebrow mt-1 text-steel">
							{room ? `${room.name} · ${first.capacity} ${room.equipment === 'mat' ? 'mats' : room.equipment === 'tower' ? 'towers' : 'beds'}` : studio.online ? `Live · up to ${first.capacity}` : `${first.capacity} places`}
						</p>
						{room ? (
							<div className="mt-5 max-w-sm">
								<RoomPlan room={room} />
							</div>
						) : null}
						<p className="mt-auto pt-5 text-sm text-graphite">
							{teachers.length ? (
								<>
									With{' '}
									{teachers.map((t, j) => (
										<span key={t.id}>
											{j > 0 ? (j === teachers.length - 1 ? ' and ' : ', ') : null}
											<Link href={`/instructors/${t.slug}`} className="link-underline text-ink focus-visible:outline-2 focus-visible:outline-ink">
												{t.firstName}
											</Link>
										</span>
									))}
								</>
							) : (
								'Teacher to be announced'
							)}
						</p>
					</Reveal>
				);
			})}
		</ul>
	);
}
