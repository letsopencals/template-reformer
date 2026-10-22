import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';

/**
 * Shell of the "Today at Tensile" board, shared by the live board and its
 * skeleton so the page doesn't jump when the timetable streams in.
 */
export function BoardFrame({
	title,
	stats,
	busy = false,
	children,
}: {
	title: string;
	stats?: React.ReactNode;
	busy?: boolean;
	children: React.ReactNode;
}) {
	return (
		<section aria-labelledby="board-title" aria-busy={busy} className="container-x section-y">
			<Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
				<div className="lg:col-span-7">
					<p className="eyebrow flex items-center gap-3 text-graphite">
						<span className="tabular">01</span>
						<span aria-hidden className="h-px w-8 bg-concrete" />
						<span className="inline-flex items-center gap-2">
							<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ink motion-safe:animate-[pulse-red_1.8s_ease-in-out_infinite]" />
							Live board · refreshed every 5 minutes
						</span>
					</p>
					<h2 id="board-title" className="display-md mt-5 text-ink">
						{title}
					</h2>
					<p className="mt-5 max-w-lg leading-relaxed text-graphite">
						The next classes in every studio. Each one is capped at the beds in the room, and when they&rsquo;re gone it says Full.
					</p>
				</div>
				<div className="lg:col-span-5 lg:justify-self-end">{stats}</div>
			</Reveal>

			<div className="mt-10 overflow-hidden rounded-[4px] border border-line bg-paper lg:mt-14">
				<div aria-hidden className="eyebrow grid grid-cols-[6rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_9.5rem_8rem] gap-x-6 border-b border-line px-6 py-3 text-steel max-lg:hidden">
					<span>Time</span>
					<span>Class</span>
					<span>Where</span>
					<span>Teacher</span>
					<span>Beds</span>
					<span className="text-right">Book</span>
				</div>
				{children}
				<div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-plaster/60 px-4 py-4 sm:px-6">
					<p className="eyebrow text-steel">Studio time · Europe/Berlin</p>
					<Link href="/timetable" className="eyebrow link-underline text-ink">
						Full timetable <span aria-hidden>→</span>
					</Link>
				</div>
			</div>
		</section>
	);
}

/** Loading state: the frame with six ruled placeholder rows. */
export function LiveBoardSkeleton() {
	return (
		<BoardFrame title="Today at Tensile" busy>
			<ol aria-label="Loading the next classes" className="divide-y divide-line">
				{Array.from({ length: 6 }, (_, i) => (
					<li key={i} className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[6rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_9.5rem_8rem] lg:gap-x-6">
						<span className="h-6 w-14 animate-pulse rounded-[2px] bg-plaster-deep" />
						<span className="h-5 w-3/4 animate-pulse rounded-[2px] bg-plaster-deep" />
						<span className="h-4 w-2/3 animate-pulse rounded-[2px] bg-plaster-deep max-lg:hidden" />
						<span className="h-4 w-1/2 animate-pulse rounded-[2px] bg-plaster-deep max-lg:hidden" />
						<span className="h-3 w-24 animate-pulse rounded-[2px] bg-plaster-deep max-lg:hidden" />
						<span className="h-3 w-16 animate-pulse justify-self-end rounded-[2px] bg-plaster-deep max-lg:hidden" />
					</li>
				))}
			</ol>
		</BoardFrame>
	);
}
