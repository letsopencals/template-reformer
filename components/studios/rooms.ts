import type { ClassType } from '@/lib/catalog';
import type { RoomMeta } from '@/lib/site-config';

/** `reformer` → "reformers" / "reformer" by count. */
export function equipmentLabel(equipment: RoomMeta['equipment'], count: number): string {
	const word = equipment === 'mat' ? 'mat' : equipment === 'tower' ? 'tower' : 'reformer';
	return count === 1 ? word : `${word}s`;
}

/** Class types that run in a given room of a studio (by `siteConfig.classes[key].rooms`). */
export function classesInRoom(classTypes: ClassType[], studioKey: string, roomKey: string): ClassType[] {
	return classTypes.filter((c) => c.meta?.rooms[studioKey] === roomKey && c.series.some((s) => s.studio?.key === studioKey));
}
