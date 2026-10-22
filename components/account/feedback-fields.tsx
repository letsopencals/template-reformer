'use client';

import { clsx } from 'clsx';
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/input';
import type { FeedbackQuestionView } from '@/lib/feedback';

const SCALE = ['1', '2', '3', '4', '5'];
const SCALE_WORDS: Record<string, string> = { '1': 'Not for me', '3': 'Good', '5': 'Loved it' };

/** One feedback question: a 1–5 spring scale for ratings, text or a select otherwise. */
export function FeedbackField({ q, value, onChange }: { q: FeedbackQuestionView; value: string; onChange: (v: string) => void }) {
	const id = `fb-${q.id}`;
	if (q.type === 'rating') {
		const scale = q.options.length > 1 ? q.options : SCALE;
		return (
			<fieldset>
				<legend className="eyebrow mb-3 block text-graphite">
					{q.title}
					{q.required ? <span className="ml-1 text-spring-red" aria-hidden>*</span> : null}
				</legend>
				<div role="radiogroup" aria-label={q.title} className="grid grid-cols-5 gap-1.5">
					{scale.map((v) => {
						const on = value === v;
						const filled = value !== '' && Number(v) <= Number(value);
						return (
							<button
								key={v}
								type="button"
								role="radio"
								aria-checked={on}
								onClick={() => onChange(v)}
								className={clsx(
									'tabular flex h-14 flex-col items-center justify-center gap-1 rounded-[2px] border text-base transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
									filled ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink',
								)}
							>
								{v}
							</button>
						);
					})}
				</div>
				<div aria-hidden className="eyebrow mt-2 flex justify-between text-[0.6rem] text-steel">
					<span>{SCALE_WORDS['1']}</span>
					<span>{SCALE_WORDS['5']}</span>
				</div>
			</fieldset>
		);
	}

	return (
		<div>
			<FieldLabel htmlFor={id} required={q.required}>
				{q.title}
			</FieldLabel>
			{q.description ? <p className="-mt-1 mb-2 text-xs text-steel">{q.description}</p> : null}
			{q.type === 'multi-line-text-field' ? (
				<Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={5000} rows={4} />
			) : q.type === 'dropdown' ? (
				<Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
					<option value="">Choose…</option>
					{q.options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</Select>
			) : q.type === 'checkbox' ? (
				<input id={id} type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : 'false')} className="h-5 w-5 accent-ink" />
			) : (
				<Input id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={500} />
			)}
		</div>
	);
}
