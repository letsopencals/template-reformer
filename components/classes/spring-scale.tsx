import { clsx } from 'clsx';
import { SPRING_VAR } from '@/components/motifs/spring-chip';
import { siteConfig, type Spring } from '@/lib/site-config';
import { SPRING_ORDER } from './directory';

/**
 * The four springs as a load scale, light to heavy, with this class's spring
 * filled and the others drawn as empty segments.
 */
export function SpringScale({ spring, className }: { spring: Spring; className?: string }) {
	const active = SPRING_ORDER.indexOf(spring);
	const info = siteConfig.springs[spring];
	return (
		<figure className={className}>
			<figcaption className="eyebrow text-graphite">Spring load</figcaption>
			<div className="mt-3 grid grid-cols-4 gap-1.5" role="img" aria-label={`${info.label}: ${info.meaning}. Step ${active + 1} of 4, light to heavy.`}>
				{SPRING_ORDER.map((s, i) => (
					<span key={s} aria-hidden className="block">
						<span
							className={clsx('block h-2.5 rounded-[1px] border', i <= active ? 'border-transparent' : 'border-concrete')}
							style={i <= active ? { background: i === active ? SPRING_VAR[s] : 'var(--color-ink)', opacity: i === active ? 1 : 0.18 } : undefined}
						/>
						<span className={clsx('eyebrow mt-2 block text-[0.6rem]', i === active ? 'text-ink' : 'text-steel')}>
							{siteConfig.springs[s].intensity}
						</span>
					</span>
				))}
			</div>
			<p className="mt-3 text-sm text-graphite">{info.meaning}.</p>
		</figure>
	);
}
