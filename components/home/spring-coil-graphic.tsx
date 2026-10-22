import { SPRING_VAR } from '@/components/motifs/spring-chip';
import type { Spring } from '@/lib/site-config';

const COILS = 14;

/** A long side-on coil: hook, loops, hook. Drawn in a 0–200 × 0–24 box. */
function coilPath(): string {
	const start = 10;
	const end = 190;
	const step = (end - start) / COILS;
	const d = ['M0 12 H6 Q10 12 10 8'];
	for (let i = 0; i < COILS; i++) {
		const x = start + i * step;
		d.push(`C${x + step * 0.15} 1 ${x + step * 0.85} 1 ${x + step} 8`);
		d.push(`C${x + step * 0.9} 23 ${x + step * 0.1} 23 ${x + step * 0.5} 16`);
	}
	d.push(`Q${end} 12 194 12 H200`);
	return d.join(' ');
}

const PATH = coilPath();

/**
 * A reformer spring between the frame (left) and the carriage (right). Hover or
 * focus inside the parent `.group` and the carriage rides in and the coil
 * compresses with the carriage-return ease. Pure CSS, so it costs no JS;
 * reduced motion makes the move instant (globals.css).
 */
export function SpringCoilGraphic({ spring }: { spring: Spring }) {
	return (
		<div aria-hidden className="relative h-14 w-full pr-12 pl-3">
			<span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-[1px] bg-ink" />
			<span className="absolute right-0 bottom-0 left-0 h-px bg-concrete" />
			<div className="relative h-full">
				<div className="absolute inset-y-0 left-0 w-full origin-left transition-transform duration-700 ease-[var(--ease-carriage)] group-hover:scale-x-[0.52] group-focus-within:scale-x-[0.52]">
					<svg viewBox="0 0 200 24" preserveAspectRatio="none" className="absolute top-1/2 left-0 h-7 w-full -translate-y-1/2 overflow-visible">
						<path d={PATH} fill="none" stroke={SPRING_VAR[spring]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
					</svg>
				</div>
				<span className="absolute top-1/2 left-full flex h-8 w-11 -translate-y-1/2 items-center justify-center rounded-[2px] bg-ink transition-[left] duration-700 ease-[var(--ease-carriage)] group-hover:left-[52%] group-focus-within:left-[52%]">
					<span className="h-3 w-5 rounded-[1px] border border-paper/40" />
				</span>
			</div>
		</div>
	);
}
