'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { Tag } from '@/components/ui/chip';
import type { BookingView } from '@/components/account/booking-view';
import { FeedbackDialog } from '@/components/account/feedback-dialog';

const PAGE = 8;

/** Past classes, newest first: date, class, where, and "Rate" / "Book again". */
export function PastClasses({ past, rated, onRated }: { past: BookingView[]; rated: Set<string>; onRated: (id: string) => void }) {
	const [shown, setShown] = useState(PAGE);
	const [rating, setRating] = useState<BookingView | null>(null);

	return (
		<section aria-labelledby="past-heading">
			<div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
				<h2 id="past-heading" className="headline text-xl text-ink">
					Past classes
				</h2>
				<span className="tabular text-sm text-graphite">{past.length}</span>
			</div>
			{past.length ? (
				<ul className="divide-y divide-line">
					{past.slice(0, shown).map((v) => (
						<li key={v.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center">
							<p className="tabular text-sm text-graphite">
								{v.dayLabel.split(' ').slice(1).join(' ')}
								<span className="block text-steel">{v.time}</span>
							</p>
							<div className="min-w-0">
								<p className="flex items-center gap-2 font-semibold text-ink">
									<SpringCoil spring={v.spring} />
									<Link href={`/account/appointments/${v.id}`} className="link-underline truncate">
										{v.title}
									</Link>
								</p>
								<p className="mt-0.5 text-sm text-graphite">
									{v.studio?.short ?? v.locationTitle ?? 'Online'}
									{v.teacher ? ` · ${v.teacher}` : ''}
								</p>
							</div>
							<div className="col-start-2 flex items-center gap-4 sm:col-start-auto">
								{rated.has(v.id) ? (
									<Tag tone="outline">Rated</Tag>
								) : (
									<button type="button" onClick={() => setRating(v)} className="link-underline text-sm text-ink">
										Rate
									</button>
								)}
								{v.bookAgainHref ? (
									<Link href={v.bookAgainHref} className="link-underline text-sm text-graphite hover:text-ink">
										Book again
									</Link>
								) : null}
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className="py-6 text-sm text-graphite">Your finished classes land here, with a quick way to rate them.</p>
			)}
			{past.length > shown ? (
				<button type="button" onClick={() => setShown((n) => n + PAGE)} className="link-underline mt-4 text-sm text-ink">
					Show {Math.min(PAGE, past.length - shown)} more
				</button>
			) : null}
			{rating ? <FeedbackDialog open onClose={() => setRating(null)} view={rating} onSent={onRated} /> : null}
		</section>
	);
}
