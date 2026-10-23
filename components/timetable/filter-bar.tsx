'use client';

import { useId, useState } from 'react';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { SpringCoil } from '@/components/motifs/spring-chip';
import type { FilterKey, TimetableParams } from '@/lib/timetable-url';
import { activeFilterCount } from '@/lib/timetable-url';
import type { LookupClass, LookupInstructor, LookupStudio, TimetableLookup } from '@/lib/timetable-lookup';
import { FilterGroup, type FilterOption } from './filter-group';
import { BANDS } from './bands';

interface FilterBarProps {
	params: TimetableParams;
	studios: LookupStudio[];
	classes: LookupClass[];
	instructors: LookupInstructor[];
	levels: TimetableLookup['levels'];
	onChange: (key: FilterKey, value: string | null) => void;
	onClear: () => void;
}

const TIME_OPTIONS: FilterOption[] = BANDS.map((b) => ({ value: b.key, label: b.label }));

/**
 * Studio, class, level, teacher and time-of-day filters. Always open on
 * desktop; behind a "Filters" toggle on phones. Every choice lives in the URL.
 */
export function FilterBar({ params, studios, classes, instructors, levels, onChange, onClear }: FilterBarProps) {
	const [open, setOpen] = useState(false);
	const panelId = useId();
	const count = activeFilterCount(params);

	return (
		<div className="border-b border-line pb-4 md:pb-6">
			<div className="flex items-center justify-between gap-4 md:hidden">
				<button
					type="button"
					aria-expanded={open}
					aria-controls={panelId}
					onClick={() => setOpen((v) => !v)}
					className="eyebrow flex items-center gap-2 py-1 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
				>
					<span aria-hidden className={clsx('tabular inline-block transition-transform duration-300', open ? 'rotate-45' : null)}>
						+
					</span>
					Filters{count > 0 ? <span className="tabular text-steel">({count})</span> : null}
				</button>
				{count > 0 ? <ClearButton onClear={onClear} /> : null}
			</div>
			<div id={panelId} className={clsx('mt-5 grid gap-5 md:mt-0 md:gap-0 md:divide-y md:divide-line', open ? null : 'max-md:hidden')}>
				<div className="grid gap-5 md:py-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-x-10">
					<FilterGroup label="Studio" options={studios.map((s) => ({ value: s.key, label: s.short }))} value={params.studio} onChange={(v) => onChange('studio', v)} />
					<FilterGroup label="Time of day" options={TIME_OPTIONS} value={params.time} onChange={(v) => onChange('time', v)} />
				</div>
				<div className="md:py-3">
					<FilterGroup
						label="Class"
						options={classes.map((c) => ({ value: c.key, label: c.short, icon: <SpringCoil spring={c.spring} coils={3} /> }))}
						value={params.class}
						onChange={(v) => onChange('class', v)}
					/>
				</div>
				<div className="md:py-3">
					<FilterGroup
						label="Level"
						options={levels.map((l) => ({ value: String(l.order), label: l.label }))}
						value={params.level === null ? null : String(params.level)}
						onChange={(v) => onChange('level', v)}
					/>
				</div>
				<div className="md:py-3">
					<FilterGroup
						label="Instructor"
						options={instructors.map((i) => ({ value: i.slug, label: i.firstName, icon: <Portrait src={i.image} /> }))}
						value={params.instructor}
						onChange={(v) => onChange('instructor', v)}
					/>
				</div>
			</div>
			{count > 0 ? (
				<div className="mt-3 hidden justify-end md:flex">
					<ClearButton onClear={onClear} />
				</div>
			) : null}
		</div>
	);
}

function Portrait({ src }: { src: string | null }) {
	return (
		<span aria-hidden className="image-placeholder -ml-1 block h-5 w-5 shrink-0 rounded-[2px]">
			<SafeImage src={src} alt="" fill sizes="20px" className="object-cover grayscale" />
		</span>
	);
}

function ClearButton({ onClear }: { onClear: () => void }) {
	return (
		<button type="button" onClick={onClear} className="eyebrow link-underline text-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
			Clear filters
		</button>
	);
}
