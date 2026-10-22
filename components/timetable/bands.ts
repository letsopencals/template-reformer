import moment from 'moment-timezone';
import type { TimeOfDay } from '@/lib/timetable';

export const BANDS: ReadonlyArray<{ key: TimeOfDay; label: string; hint: string }> = [
	{ key: 'morning', label: 'Morning', hint: 'before 10:00' },
	{ key: 'midday', label: 'Midday', hint: '10:00–16:00' },
	{ key: 'evening', label: 'Evening', hint: 'from 16:00' },
];

/** `2026-10-27` → { weekday: 'Tue', day: '27', month: 'Oct' }. */
export function dayHeading(date: string): { weekday: string; day: string; month: string } {
	const m = moment.utc(date, 'YYYY-MM-DD');
	return { weekday: m.format('ddd'), day: m.format('D'), month: m.format('MMM') };
}
