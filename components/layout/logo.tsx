/* eslint-disable @next/next/no-img-element */
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

/**
 * The brand mark. Uses the store's logo (Storefront customisation in the
 * dashboard) when set, else the bundled `/logo.svg` wordmark. A plain <img>,
 * because store logos are arbitrary sizes and SVGs.
 */
export function Logo({ src, className, inverted = false }: { src?: string | null; className?: string; inverted?: boolean }) {
	return (
		<img
			src={src || '/logo.svg'}
			alt={siteConfig.name}
			className={clsx('h-6 w-auto select-none sm:h-7', inverted && !src && 'invert', className)}
			draggable={false}
		/>
	);
}
