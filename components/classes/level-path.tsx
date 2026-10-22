import { clsx } from 'clsx';
import { SPRING_VAR, SpringCoil } from '@/components/motifs/spring-chip';
import { siteConfig } from '@/lib/site-config';
import { requirementLabel, stepSpring } from './directory';

/**
 * The level path, Foundations → Flow → Sculpt → Tower, drawn as stations on a
 * tension cable. Static guidance for visitors (the account page shows real
 * progress). `activeKey` is a class key; its step gets the spring-coloured marker.
 */
export function LevelPath({ activeKey, className }: { activeKey?: string | null; className?: string }) {
	const steps = siteConfig.levels;
	return (
		<ol className={clsx('relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6', className)} aria-label="Level path">
			<span aria-hidden className="cable absolute top-[11px] right-0 left-0 max-lg:hidden" />
			{steps.map((step, i) => {
				const spring = stepSpring(step);
				const active = activeKey ? step.classKeys.includes(activeKey) : false;
				const req = requirementLabel(step);
				return (
					<li key={step.key} className="relative" aria-current={active ? 'step' : undefined}>
						<span
							aria-hidden
							className={clsx('relative block size-[22px] rounded-[2px] border-2 bg-plaster', active ? 'border-ink' : 'border-concrete')}
							style={active ? { background: SPRING_VAR[spring] } : undefined}
						/>
						<p className="eyebrow mt-4 text-steel">
							Step {i + 1} / {steps.length}
						</p>
						<p className={clsx('headline mt-1 flex items-center gap-2 text-xl', active ? 'text-ink' : 'text-ink/80')}>
							{step.label}
							<SpringCoil spring={spring} />
						</p>
						<p className="mt-2 text-sm leading-relaxed text-graphite">{step.description}</p>
						<p className="tabular mt-2 text-[0.72rem] text-steel">{req ?? 'Start here'}</p>
					</li>
				);
			})}
		</ol>
	);
}

/** Four tiny stations for cards: where a class sits on the path. Null for classes off the path. */
export function LevelPips({ classKey }: { classKey: string }) {
	const steps = siteConfig.levels;
	const index = steps.findIndex((s) => s.classKeys.includes(classKey));
	if (index < 0) return <span className="eyebrow text-steel">Any level</span>;
	return (
		<span className="inline-flex items-center gap-2" role="img" aria-label={`Level path step ${index + 1} of ${steps.length}`}>
			<span aria-hidden className="flex items-center">
				{steps.map((s, i) => (
					<span key={s.key} className="flex items-center">
						{i > 0 ? <span className={clsx('h-px w-3', i <= index ? 'bg-ink' : 'bg-concrete')} /> : null}
						<span
							className={clsx('size-2 rounded-[1px] border', i === index ? 'border-ink' : i < index ? 'border-ink bg-ink' : 'border-concrete')}
							style={i === index ? { background: SPRING_VAR[stepSpring(s)] } : undefined}
						/>
					</span>
				))}
			</span>
			<span aria-hidden className="eyebrow text-steel">
				Step {index + 1}
			</span>
		</span>
	);
}
