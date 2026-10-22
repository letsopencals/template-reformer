'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useTransform } from 'framer-motion';
import { CarriageRail } from '@/components/motifs/carriage-rail';
import { SpringChip } from '@/components/motifs/spring-chip';
import { useScrollProgress } from '@/components/motion/scroll-progress';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { Reveal } from '@/components/motion/reveal';
import { classMeta, siteConfig, type LevelStep } from '@/lib/site-config';

const STEPS: LevelStep[] = siteConfig.levels;

function requirement(step: LevelStep): string {
	if (!step.requires) return 'Start here';
	const { count, classKeys } = step.requires;
	const name = classKeys.map((k) => classMeta(k)?.short ?? k).join(' or ');
	return `After ${count} ${name} ${count === 1 ? 'class' : 'classes'}`;
}

/**
 * The level path, Foundations → Flow → Sculpt → Tower, drawn as a carriage rail
 * that rides along as the section scrolls past. Guidance only: nothing is
 * locked at booking.
 */
export function LevelPath({ available }: { available: string[] }) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const scroll = useScrollProgress(ref);
	const progress = useTransform(scroll, [0.15, 0.6], [0, 1]);
	const known = new Set(available);

	return (
		<div ref={ref} className="mt-12 lg:mt-16">
			<div className="relative w-[calc(75%+1.5rem)] max-lg:hidden">
				{reduce ? <CarriageRail value={0} /> : <CarriageRail progress={progress} />}
				{STEPS.map((s, i) => (
					<span
						key={s.key}
						aria-hidden
						className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-ink"
						style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}
					/>
				))}
			</div>
			<ol className="relative grid gap-10 max-lg:border-l max-lg:border-concrete max-lg:pl-6 lg:mt-8 lg:grid-cols-4 lg:gap-x-8">
				{STEPS.map((step, i) => {
					const spring = classMeta(step.classKeys[0])?.spring ?? 'green';
					const href = known.has(step.key) ? `/classes/${step.key}` : '/classes';
					return (
						<Reveal as="li" key={step.key} delay={i * 0.08} className="relative">
							<span aria-hidden className="absolute top-1.5 -left-[1.72rem] h-2.5 w-2.5 rounded-[1px] bg-ink lg:hidden" />
							<p className="eyebrow text-steel">
								<span className="tabular">Step 0{i + 1}</span> · {requirement(step)}
							</p>
							<h3 className="display-sm mt-3 text-ink">{step.label}</h3>
							<SpringChip spring={spring} className="mt-3" />
							<p className="mt-3 max-w-xs leading-relaxed text-graphite">{step.description}</p>
							<Link href={href} className="eyebrow link-underline mt-4 inline-block text-ink">
								About {step.label} <span aria-hidden>→</span>
							</Link>
						</Reveal>
					);
				})}
			</ol>
		</div>
	);
}
