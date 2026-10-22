import { clsx } from 'clsx';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { money } from '@/components/timetable/labels';

/** Add-ons as quiet rows with a − / + stepper. */
export function AddOnStepper({
	addOns,
	selected,
	loading,
	onChange,
	disabled,
}: {
	addOns: AddOnListItemResponse[];
	selected: Map<string, number>;
	loading: boolean;
	onChange: (id: string, quantity: number) => void;
	disabled?: boolean;
}) {
	if (loading) {
		return (
			<div className="space-y-2" aria-busy="true" aria-label="Loading extras">
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-12" />
			</div>
		);
	}
	if (addOns.length === 0) return null;
	return (
		<ul className="divide-y divide-line border-y border-line">
			{addOns.map((a) => {
				const qty = selected.get(a.id) ?? 0;
				const max = a.maxQuantity ?? 9;
				const blurb = siteConfig.addOns[a.slug]?.blurb ?? a.description;
				return (
					<li key={a.id} className="flex items-center gap-4 py-3">
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-ink">{a.title}</p>
							{blurb ? <p className="mt-0.5 text-xs leading-relaxed text-graphite">{blurb}</p> : null}
						</div>
						<span className="tabular text-sm text-graphite">{money(a.price)}</span>
						<div className="flex items-center" role="group" aria-label={`${a.title} quantity`}>
							<StepButton label={`One fewer ${a.title}`} glyph="−" disabled={disabled || qty === 0} onClick={() => onChange(a.id, qty - 1)} />
							<span className={clsx('tabular w-7 text-center text-sm', qty > 0 ? 'text-ink' : 'text-steel')} aria-live="polite">
								{qty}
							</span>
							<StepButton label={`One more ${a.title}`} glyph="+" disabled={disabled || qty >= max} onClick={() => onChange(a.id, qty + 1)} />
						</div>
					</li>
				);
			})}
		</ul>
	);
}

function StepButton({ label, glyph, disabled, onClick }: { label: string; glyph: string; disabled?: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			className="tabular flex h-9 w-9 items-center justify-center rounded-[2px] border border-line text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-35"
		>
			<span aria-hidden>{glyph}</span>
		</button>
	);
}
