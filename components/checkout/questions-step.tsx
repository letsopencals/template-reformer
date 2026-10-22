'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse as CheckoutQuestion } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Field } from './field';
import { QUESTIONS_FORM_ID } from './form-ids';

/**
 * A few questions, rendered from the API: dropdowns, text, ratings and
 * checkboxes (the waiver is a required checkbox, so the browser blocks the
 * submit until it's ticked).
 */
export function QuestionsStep() {
	const { questions, submitting, isExpired, handleSaveAnswers } = useCheckout();
	const sorted = useMemo(() => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [questions]);

	return (
		<form id={QUESTIONS_FORM_ID} onSubmit={handleSaveAnswers} className="space-y-7">
			<p className="text-sm text-graphite">Your teacher reads these before class to set up your springs. Only they see your answers.</p>
			{sorted.map((q) => (
				<QuestionField key={q.id} question={q} />
			))}
			<Button type="submit" variant="primary" size="lg" className="max-lg:hidden" disabled={submitting || isExpired}>
				{submitting ? 'Saving…' : 'Continue'}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}

function QuestionField({ question: q }: { question: CheckoutQuestion }) {
	const { answers, setAnswers } = useCheckout();
	const translation = q.translations?.[0];
	const title = translation?.title ?? q.internalName;
	const description = translation?.description;
	const options = translation?.options;
	const id = `question-${q.id}`;
	const value = answers[q.id] ?? '';
	const set = (v: string) => setAnswers((prev) => ({ ...prev, [q.id]: v }));
	const describedBy = description ? `${id}-hint` : undefined;

	if (q.type === 'checkbox') return <CheckboxQuestion id={id} title={title} description={description} required={q.required} checked={value === 'true'} onChange={(c) => set(c ? 'true' : 'false')} />;
	if (q.type === 'rating') return <RatingQuestion id={id} title={title} description={description} required={q.required} value={value} onChange={set} />;
	if (q.type === 'file-upload') return null;

	return (
		<Field htmlFor={id} label={title} required={q.required} hint={description}>
			{q.type === 'dropdown' && options ? (
				<Select id={id} required={q.required} value={value} onChange={(e) => set(e.target.value)} aria-describedby={describedBy}>
					<option value="">Choose one</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</Select>
			) : q.type === 'multi-line-text-field' ? (
				<Textarea id={id} required={q.required} value={value} onChange={(e) => set(e.target.value)} aria-describedby={describedBy} rows={3} />
			) : (
				<Input id={id} type="text" required={q.required} value={value} onChange={(e) => set(e.target.value)} aria-describedby={describedBy} />
			)}
		</Field>
	);
}

interface CheckboxProps {
	id: string;
	title: string;
	description?: string | null;
	required: boolean;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

/** The waiver: the question itself is the checkbox label. */
function CheckboxQuestion({ id, title, description, required, checked, onChange }: CheckboxProps) {
	return (
		<div className={clsx('rounded-[2px] border px-4 py-4 transition-colors', checked ? 'border-ink bg-paper' : 'border-line')}>
			<label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
				<input
					id={id}
					type="checkbox"
					required={required}
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					aria-describedby={description ? `${id}-hint` : undefined}
					className="mt-0.5 h-4 w-4 shrink-0 rounded-[2px] accent-ink"
				/>
				<span>
					{title}
					{required ? (
						<span className="ml-1 text-spring-red" aria-hidden>
							*
						</span>
					) : null}
				</span>
			</label>
			{description ? (
				<p id={`${id}-hint`} className="mt-2 pl-7 text-xs leading-relaxed text-graphite">
					{description}
				</p>
			) : null}
		</div>
	);
}

function RatingQuestion({ id, title, description, required, value, onChange }: Omit<CheckboxProps, 'checked' | 'onChange'> & { value: string; onChange: (v: string) => void }) {
	return (
		<fieldset aria-describedby={description ? `${id}-hint` : undefined}>
			<legend className="eyebrow mb-2.5 text-graphite">
				{title}
				{required ? <span className="ml-1 text-spring-red" aria-hidden>*</span> : null}
			</legend>
			{description ? <p id={`${id}-hint`} className="-mt-1 mb-2.5 text-xs text-graphite">{description}</p> : null}
			<div className="flex gap-1.5">
				{['1', '2', '3', '4', '5'].map((n) => (
					<label key={n} className={clsx('tabular flex h-10 w-10 cursor-pointer items-center justify-center rounded-[2px] border text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink', value === n ? 'border-ink bg-ink text-paper' : 'border-line text-ink hover:border-ink')}>
						<input type="radio" name={id} value={n} required={required} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
						{n}
					</label>
				))}
			</div>
		</fieldset>
	);
}
