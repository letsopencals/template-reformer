import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';

export interface PageHeadingProps {
	eyebrow?: string;
	title: React.ReactNode;
	intro?: React.ReactNode;
	className?: string;
	children?: React.ReactNode;
}

/** Standard top-of-page heading (clears the fixed header): mono eyebrow, expanded display title, a tension cable. */
export function PageHeading({ eyebrow, title, intro, className, children }: PageHeadingProps) {
	return (
		<header className={clsx('container-x pt-32 pb-10 lg:pt-40 lg:pb-14', className)}>
			<Reveal>
				{eyebrow ? <p className="eyebrow text-graphite">{eyebrow}</p> : null}
				<h1 className="display-lg mt-4 text-ink">{title}</h1>
				{intro ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">{intro}</p> : null}
			</Reveal>
			<span aria-hidden className="cable cable-draw mt-10" />
			{children}
		</header>
	);
}
