import { springInfo } from '@/lib/site-config';
import type { Occurrence } from '@/lib/timetable';
import type { LookupClass } from '@/lib/timetable-lookup';
import { placeLabel } from '@/components/timetable/labels';

/** Teacher, place, spring and level as a mono spec sheet, then prerequisite and what to bring. */
export function SheetFacts({ occurrence: o, cls, teacher }: { occurrence: Occurrence; cls: LookupClass | null; teacher: string | null }) {
	const spring = springInfo(o.spring);
	const rows: Array<[string, string]> = [
		['Teacher', teacher ?? '—'],
		['Where', placeLabel(o)],
		['Springs', `${spring.label} · ${spring.meaning}`],
		['Level', o.level],
	];
	return (
		<div className="mt-6">
			{cls?.tagline ? <p className="text-[0.95rem] leading-relaxed text-ink">{cls.tagline}</p> : null}
			<dl className="mt-5 divide-y divide-line border-y border-line">
				{rows.map(([k, v]) => (
					<div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5 text-sm">
						<dt className="eyebrow pt-0.5 text-steel">{k}</dt>
						<dd className="text-ink">{v}</dd>
					</div>
				))}
			</dl>
			{cls?.prerequisite ? (
				<p className="mt-5 border-l-2 border-ink pl-3 text-sm text-ink">
					<span className="eyebrow mr-2 text-graphite">Before you book</span>
					{cls.prerequisite}
				</p>
			) : null}
			{cls && cls.whatToBring.length > 0 ? (
				<div className="mt-5">
					<p className="eyebrow text-graphite">Bring</p>
					<ul className="mt-2 flex flex-wrap gap-1.5">
						{cls.whatToBring.map((b) => (
							<li key={b} className="rounded-[2px] border border-line px-2.5 py-1 text-xs text-ink">
								{b}
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}
