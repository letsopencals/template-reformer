import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';

/** Page heading inside the account shell: mono eyebrow, expanded display title, a line of copy. */
export function AccountHeading({
	eyebrow,
	title,
	intro,
	aside,
	className,
}: {
	eyebrow: string;
	title: React.ReactNode;
	intro?: React.ReactNode;
	/** Right-hand slot (a count, a button). */
	aside?: React.ReactNode;
	className?: string;
}) {
	return (
		<header className={clsx('flex flex-wrap items-end justify-between gap-6 pt-10 pb-8 lg:pt-14', className)}>
			<Reveal className="min-w-0">
				<p className="eyebrow text-graphite">{eyebrow}</p>
				<h1 className="display-lg mt-3 text-ink">{title}</h1>
				{intro ? <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-graphite">{intro}</p> : null}
			</Reveal>
			{aside ? <div className="shrink-0">{aside}</div> : null}
		</header>
	);
}
