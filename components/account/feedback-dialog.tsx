'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Notice, Spinner } from '@/components/auth/auth-feedback';
import { fetcher } from '@/lib/fetcher';
import type { FeedbackQuestionView } from '@/lib/feedback';
import { shortTitle, type BookingView } from '@/components/account/booking-view';
import { FeedbackField } from '@/components/account/feedback-fields';

const SWR_OPTS = { revalidateOnFocus: false } as const;

/**
 * "How was your class?": the product's feedback questions (rating + a note for
 * the teacher). Loads only while open; shows a thank-you when answers exist.
 */
export function FeedbackDialog({ open, onClose, view, onSent }: { open: boolean; onClose: () => void; view: BookingView; onSent?: (id: string) => void }) {
	const base = `/api/account/appointments/${encodeURIComponent(view.id)}`;
	const { data: questions, isLoading } = useSWR<FeedbackQuestionView[]>(open ? `${base}/feedback` : null, fetcher, SWR_OPTS);
	const { data: detail, mutate } = useSWR<AppointmentDetailResponse>(open ? base : null, fetcher, SWR_OPTS);
	const [values, setValues] = useState<Record<string, string>>({});
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const answered = (detail?.feedbackQuestionAnswers?.length ?? 0) > 0;
	const missing = (questions ?? []).some((q) => q.required && !values[q.id]);

	const submit = async () => {
		if (!questions?.length) return;
		setSending(true);
		setError(null);
		try {
			const answers = questions.map((q) => ({ questionId: q.id, question: q.title, answer: values[q.id] ?? null }));
			const res = await fetch(`${base}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
			if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'We couldn’t send that. Please try again.');
			onSent?.(view.id);
			await mutate();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong.');
		} finally {
			setSending(false);
		}
	};

	const teacher = view.teacherFirstName ? ` with ${view.teacherFirstName}` : '';
	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={answered ? 'Thanks for the note' : `How was ${shortTitle(view)}${teacher}?`}
			description={<span className="tabular">{view.dayLabel} · {view.time} · {view.studio?.short ?? view.locationTitle ?? 'Online'}</span>}
			footer={
				answered || !questions?.length ? (
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				) : (
					<Button onClick={() => void submit()} disabled={sending || missing}>
						{sending ? 'Sending…' : 'Send feedback'}
					</Button>
				)
			}
		>
			{error ? <Notice className="mb-5">{error}</Notice> : null}
			{isLoading ? (
				<Spinner label="Loading questions" />
			) : answered ? (
				<p className="text-[0.95rem] leading-relaxed text-graphite">
					{view.teacherFirstName ?? 'Your teacher'} reads every one. See you on the reformer.
				</p>
			) : questions?.length ? (
				<div className="space-y-6">
					{questions.map((q) => (
						<FeedbackField key={q.id} q={q} value={values[q.id] ?? ''} onChange={(v) => setValues((prev) => ({ ...prev, [q.id]: v }))} />
					))}
				</div>
			) : (
				<p className="text-[0.95rem] text-graphite">This class has no feedback form. Tell us anything at the desk next time.</p>
			)}
		</Dialog>
	);
}
