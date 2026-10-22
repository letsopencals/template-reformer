import { describe, expect, it } from 'vitest';
import { countCompleted, levelPath } from '@/lib/level-path';

const NOW = Date.parse('2026-10-20T12:00:00Z');

describe('countCompleted', () => {
	it('counts completed and over-but-scheduled classes by class key', () => {
		const counts = countCompleted(
			[
				{ status: 'completed', to: '2026-10-01T09:00:00Z', product: { slug: 'foundations-mitte-sofia' } },
				{ status: 'scheduled', to: '2026-10-10T09:00:00Z', product: { slug: 'flow-mitte-lena' } },
				{ status: 'scheduled', to: '2026-10-30T09:00:00Z', product: { slug: 'flow-mitte-lena' } },
				{ status: 'canceled', to: '2026-10-05T09:00:00Z', product: { slug: 'flow-mitte-lena' } },
				{ status: 'completed', to: '2026-10-05T09:00:00Z', product: { slug: 'jump-board-mitte-jonas' } },
			],
			NOW,
		);
		expect(counts).toEqual({ foundations: 1, flow: 1, 'jump-board': 1 });
	});
});

describe('levelPath', () => {
	it('starts with Foundations unlocked and the rest locked', () => {
		const r = levelPath({});
		expect(r.steps.map((s) => s.status)).toEqual(['unlocked', 'locked', 'locked', 'locked']);
		expect(r.current?.step.key).toBe('foundations');
		expect(r.next?.step.key).toBe('flow');
	});

	it('unlocks Flow after one Foundations and tracks Sculpt progress', () => {
		const r = levelPath({ foundations: 1, flow: 4 });
		expect(r.steps.map((s) => s.status)).toEqual(['done', 'done', 'locked', 'locked']);
		expect(r.next?.step.key).toBe('sculpt');
		expect(r.next?.progress).toEqual({ count: 4, required: 10 });
	});

	it('caps progress at the requirement', () => {
		const r = levelPath({ foundations: 1, flow: 25, sculpt: 20 });
		expect(r.steps.find((s) => s.step.key === 'tower')?.status).toBe('unlocked');
		expect(r.steps.find((s) => s.step.key === 'sculpt')?.progress).toEqual({ count: 10, required: 10 });
		expect(r.next).toBeNull();
	});
});
