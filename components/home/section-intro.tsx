import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';

/**
 * Home section heading: a mono index + eyebrow, an expanded display title with
 * its light counterweight, an optional intro and a right-aligned action.
 */
export function SectionIntro({
	index,
	eyebrow,
	title,
	intro,
	action,
	tone = 'ink',
	id,
	className,
}: {
	index: string;
	eyebrow: string;
	title: React.ReactNode;
	intro?: React.ReactNode;
	action?: React.ReactNode;
	tone?: 'ink' | 'paper';
	id?: string;
	className?: string;
}) {
	const muted = tone === 'paper' ? 'text-paper/60' : 'text-graphite';
	return (
		<Reveal className={clsx('grid gap-6 lg:grid-cols-12 lg:items-end', className)}>
			<div className="lg:col-span-8">
				<p className={clsx('eyebrow flex items-center gap-3', muted)}>
					<span className="tabular">{index}</span>
					<span aria-hidden className={clsx('h-px w-8', tone === 'paper' ? 'bg-paper/40' : 'bg-concrete')} />
					{eyebrow}
				</p>
				<h2 id={id} className={clsx('display-md mt-5', tone === 'paper' ? 'text-paper' : 'text-ink')}>
					{title}
				</h2>
				{intro ? <p className={clsx('mt-5 max-w-xl text-[1.05rem] leading-relaxed', muted)}>{intro}</p> : null}
			</div>
			{action ? <div className="lg:col-span-4 lg:justify-self-end">{action}</div> : null}
		</Reveal>
	);
}
