import type { PrivateFormat } from '@/lib/catalog';

/**
 * Privates wizard state: studio → format → teacher → time → extras → review.
 * A reducer so the step rules are testable (`wizard-state.test.ts`). Changing
 * an earlier answer clears the answers that depend on it; picking the same
 * answer again just moves on.
 */

export const FIRST_AVAILABLE = 'any';

export const STEPS = ['Studio', 'Format', 'Teacher', 'Time', 'Extras'] as const;
/** 0–4 = the steps above; 5 = everything answered (review). */
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export interface WizardState {
	step: StepIndex;
	studioId: string | null;
	format: PrivateFormat | null;
	/** Instructor id, `FIRST_AVAILABLE`, or null when not chosen yet. */
	instructor: string | null;
	date: string | null;
	/** `PrivateTime.key` (UTC start ISO). */
	timeKey: string | null;
	extrasDone: boolean;
}

export type WizardAction =
	| { type: 'studio'; id: string }
	/** `instructor` preselects a teacher (a deep-linked one who teaches this format). */
	| { type: 'format'; format: PrivateFormat; instructor?: string | null }
	| { type: 'instructor'; id: string }
	| { type: 'date'; date: string }
	| { type: 'time'; key: string; date?: string | null }
	| { type: 'timeGone' }
	| { type: 'extrasDone' }
	| { type: 'edit'; step: StepIndex };

export function initialWizard(studioId: string | null = null, format: PrivateFormat | null = null, instructor: string | null = null): WizardState {
	const f = studioId ? format : null;
	const base: WizardState = { step: 0, studioId, format: f, instructor: f ? instructor : null, date: null, timeKey: null, extrasDone: false };
	return { ...base, step: nextStep(base) };
}

/** The first unanswered step. */
export function nextStep(s: Omit<WizardState, 'step'>): StepIndex {
	if (!s.studioId) return 0;
	if (!s.format) return 1;
	if (!s.instructor) return 2;
	if (!s.timeKey) return 3;
	if (!s.extrasDone) return 4;
	return 5;
}

function advance(s: WizardState): WizardState {
	return { ...s, step: nextStep(s) };
}

const CLEAR_TIME = { date: null, timeKey: null, extrasDone: false } as const;

export function wizardReducer(s: WizardState, a: WizardAction): WizardState {
	switch (a.type) {
		case 'studio':
			return a.id === s.studioId ? advance(s) : advance({ ...s, studioId: a.id, format: null, instructor: null, ...CLEAR_TIME });
		case 'format':
			// The teacher list can differ per format, and times are per variant.
			return a.format === s.format ? advance(s) : advance({ ...s, format: a.format, instructor: a.instructor ?? null, ...CLEAR_TIME });
		case 'instructor':
			return a.id === s.instructor ? advance(s) : advance({ ...s, instructor: a.id, ...CLEAR_TIME });
		case 'date':
			return { ...s, date: a.date, timeKey: a.date === s.date ? s.timeKey : null, step: 3 };
		case 'time':
			return advance({ ...s, timeKey: a.key, date: a.date ?? s.date });
		case 'timeGone':
			return { ...s, timeKey: null, step: 3 };
		case 'extrasDone':
			return advance({ ...s, extrasDone: true });
		case 'edit':
			return a.step <= nextStep(s) ? { ...s, step: a.step } : s;
	}
}
