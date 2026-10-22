import { describe, expect, it } from 'vitest';
import { FIRST_AVAILABLE, initialWizard, wizardReducer, type WizardState } from './wizard-state';

function run(state: WizardState, ...actions: Parameters<typeof wizardReducer>[1][]): WizardState {
	return actions.reduce(wizardReducer, state);
}

describe('wizardReducer', () => {
	it('walks studio → format → teacher → time → extras → review', () => {
		const s = run(
			initialWizard(),
			{ type: 'studio', id: 'mitte' },
			{ type: 'format', format: 'duet' },
			{ type: 'instructor', id: FIRST_AVAILABLE },
			{ type: 'date', date: '2026-10-27' },
			{ type: 'time', key: 't1' },
		);
		expect(s.step).toBe(4);
		expect(run(s, { type: 'extrasDone' }).step).toBe(5);
	});

	it('starts at the format step when deep-linked to a studio', () => {
		expect(initialWizard('mitte').step).toBe(1);
		expect(initialWizard('mitte', 'duet').step).toBe(2);
		expect(initialWizard(null, 'duet').format).toBeNull();
		expect(initialWizard('mitte', 'solo', 'lena')).toMatchObject({ instructor: 'lena', step: 3 });
		expect(initialWizard('mitte', null, 'lena')).toMatchObject({ instructor: null, step: 1 });
	});

	it('preselects a deep-linked teacher when the format is picked', () => {
		const s = wizardReducer(initialWizard('mitte'), { type: 'format', format: 'duet', instructor: 'lena' });
		expect(s).toMatchObject({ instructor: 'lena', step: 3 });
	});

	it('clears dependent answers when an earlier one changes', () => {
		const done = run(initialWizard('mitte', 'solo'), { type: 'instructor', id: 'lena' }, { type: 'date', date: 'd' }, { type: 'time', key: 't' }, { type: 'extrasDone' });
		const changed = run(done, { type: 'edit', step: 2 }, { type: 'instructor', id: 'sofia' });
		expect(changed).toMatchObject({ instructor: 'sofia', date: null, timeKey: null, extrasDone: false, step: 3 });
		const same = run(done, { type: 'edit', step: 0 }, { type: 'studio', id: 'mitte' });
		expect(same).toMatchObject({ format: 'solo', timeKey: 't', step: 5 });
	});

	it('cannot jump ahead to an unanswered step', () => {
		const s = initialWizard();
		expect(wizardReducer(s, { type: 'edit', step: 3 })).toBe(s);
	});

	it('returns to the time step when the picked time is gone', () => {
		const s = run(initialWizard('m', 'solo'), { type: 'instructor', id: 'x' }, { type: 'date', date: 'd' }, { type: 'time', key: 't' }, { type: 'timeGone' });
		expect(s).toMatchObject({ step: 3, timeKey: null, date: 'd' });
	});
});
