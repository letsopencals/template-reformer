import { SafeImage } from '@/components/ui/safe-image';
import { SpringChip } from '@/components/motifs/spring-chip';
import { formatLocalDate } from '@/lib/class-sheet';
import type { Occurrence } from '@/lib/timetable';
import { durationMinutes } from '@/components/timetable/labels';
import { siteConfig } from '@/lib/site-config';

const END_TIME = new Intl.DateTimeFormat('en-GB', { timeZone: siteConfig.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Photo, then the when: "Tue 27 Oct  18:30–19:20". */
export function SheetHero({ occurrence: o, image, title }: { occurrence: Occurrence; image: string | null; title: string }) {
	const end = END_TIME.format(Date.parse(o.end));
	return (
		<div>
			<div className="image-placeholder relative -mx-5 -mt-6 aspect-[16/9] sm:-mx-7">
				<SafeImage src={image} alt={title} fill sizes="(min-width: 768px) 520px, 100vw" className="object-cover" />
				<span className="absolute bottom-3 left-5 bg-paper/90 px-2 py-1 sm:left-7">
					<SpringChip spring={o.spring} label="spring" />
				</span>
			</div>
			<p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
				<span className="eyebrow text-graphite">{formatLocalDate(o.localDate)}</span>
				<span className="tabular text-[1.9rem] leading-none tracking-[-0.03em] text-ink">
					{o.localTime}
					<span className="text-steel">–{end}</span>
				</span>
				<span className="tabular text-xs text-steel">{durationMinutes(o)} min</span>
			</p>
		</div>
	);
}
