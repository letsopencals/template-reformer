import { Chip } from '@/components/ui/chip';

export interface FilterOption {
	value: string;
	label: string;
	/** Leading glyph (spring coil, portrait). */
	icon?: React.ReactNode;
}

/** One labelled row of toggle chips. "All" clears the filter. */
export function FilterGroup({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: FilterOption[];
	value: string | null;
	onChange: (value: string | null) => void;
}) {
	if (options.length === 0) return null;
	return (
		<fieldset className="min-w-0">
			<legend className="eyebrow mb-2.5 text-graphite">{label}</legend>
			<div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-0.5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
				<Chip size="sm" selected={value === null} onClick={() => onChange(null)}>
					All
				</Chip>
				{options.map((o) => (
					<Chip key={o.value} size="sm" selected={value === o.value} onClick={() => onChange(value === o.value ? null : o.value)}>
						{o.icon ?? null}
						{o.label}
					</Chip>
				))}
			</div>
		</fieldset>
	);
}
