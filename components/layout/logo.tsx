'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

const FALLBACK = '/logo.svg';

/**
 * The brand mark. Uses the store's logo (Storefront customisation in the
 * dashboard) when set, else the bundled `/logo.svg` wordmark, and falls back
 * to it when the store logo fails to load. A plain <img>, because store logos
 * are arbitrary sizes and SVGs.
 */
export function Logo({ src, className, inverted = false }: { src?: string | null; className?: string; inverted?: boolean }) {
	const [failed, setFailed] = useState(false);
	const url = src && !failed ? src : FALLBACK;
	// An SSR'd <img> can fail before hydration attaches onError: check on mount too.
	const ref = useCallback(
		(img: HTMLImageElement | null) => {
			if (img && url !== FALLBACK && img.complete && img.naturalWidth === 0) setFailed(true);
		},
		[url],
	);
	return (
		<img
			ref={ref}
			src={url}
			alt={siteConfig.name}
			onError={url === FALLBACK ? undefined : () => setFailed(true)}
			className={clsx('h-6 w-auto select-none sm:h-7', inverted && url === FALLBACK ? 'invert' : null, className)}
			draggable={false}
		/>
	);
}
