import { clsx } from 'clsx';
import type { RoomMeta } from '@/lib/site-config';

export interface RoomPlanProps {
	room: Pick<RoomMeta, 'name' | 'beds' | 'layout' | 'equipment'>;
	/** Beds taken (filled ink from the back row). */
	taken?: number;
	/** 0-based bed index (or indices, e.g. a duet) to highlight as "yours" (spring colour outline). */
	highlight?: number | number[] | null;
	/** Colour for the highlighted bed (CSS colour, e.g. `var(--color-spring-blue)`). */
	highlightColor?: string;
	/** Draw the room name and the front (teacher) line. */
	showLabels?: boolean;
	className?: string;
}

const BED_W = 22;
const BED_H = 56;
const GAP_X = 14;
const GAP_Y = 22;
const PAD = 18;

/**
 * SVG room plan: beds in `layout.rows × layout.cols`, drawn as rounded
 * rectangles with a headrest and a footbar. Free beds are outlined, taken beds
 * filled ink. The teacher's spot is at the front (bottom). Mat rooms draw flat
 * mats; tower rooms add the tower frame.
 */
export function RoomPlan({ room, taken = 0, highlight = null, highlightColor = 'var(--color-ink)', showLabels = true, className }: RoomPlanProps) {
	const { rows, cols } = room.layout;
	const w = PAD * 2 + cols * BED_W + (cols - 1) * GAP_X;
	const h = PAD * 2 + rows * BED_H + (rows - 1) * GAP_Y + (showLabels ? 26 : 0);
	const beds = Math.min(room.beds, rows * cols);
	const mat = room.equipment === 'mat';
	const tower = room.equipment === 'tower';

	return (
		<svg viewBox={`0 0 ${w} ${h}`} className={clsx('h-auto w-full', className)} role="img" aria-label={`${room.name}: ${beds - Math.min(taken, beds)} of ${beds} free`}>
			<rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx="2" fill="none" stroke="var(--color-line)" />
			{Array.from({ length: beds }, (_, i) => {
				const r = Math.floor(i / cols);
				const c = i % cols;
				const x = PAD + c * (BED_W + GAP_X);
				const y = PAD + r * (BED_H + GAP_Y);
				const isTaken = i < taken;
				const isMine = Array.isArray(highlight) ? highlight.includes(i) : highlight === i;
				const stroke = isMine ? highlightColor : isTaken ? 'var(--color-ink)' : 'var(--color-concrete)';
				const fill = isTaken && !isMine ? 'var(--color-ink)' : 'none';
				return (
					<g key={i}>
						{tower ? <rect x={x - 3} y={y - 4} width={BED_W + 6} height={8} rx="1" fill="none" stroke={stroke} strokeWidth="1" /> : null}
						<rect x={x} y={y} width={BED_W} height={BED_H} rx={mat ? 1 : 3} fill={fill} stroke={stroke} strokeWidth={isMine ? 2 : 1.2} />
						{!mat ? (
							<>
								{/* headrest */}
								<rect x={x + 5} y={y + 4} width={BED_W - 10} height={6} rx="1.5" fill={isTaken && !isMine ? 'var(--color-paper)' : 'none'} stroke={isTaken && !isMine ? 'none' : stroke} strokeWidth="1" />
								{/* footbar */}
								<line x1={x - 3} x2={x + BED_W + 3} y1={y + BED_H - 7} y2={y + BED_H - 7} stroke={isTaken && !isMine ? 'var(--color-paper)' : stroke} strokeWidth="1.4" strokeLinecap="round" />
							</>
						) : null}
					</g>
				);
			})}
			{showLabels ? (
				<g>
					<line x1={PAD} x2={w - PAD} y1={h - 24} y2={h - 24} stroke="var(--color-line)" strokeDasharray="3 3" />
					<text x={w / 2} y={h - 9} textAnchor="middle" className="fill-[var(--color-steel)] font-mono text-[9px] uppercase tracking-[0.12em]">
						Front · {room.name}
					</text>
				</g>
			) : null}
		</svg>
	);
}
