'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

const FALLBACK = '/logo.svg';

type Shape = 'wide' | 'compact';

/** Wordmarks are wide; anything closer to square (badges, icons) needs more height to stay legible. */
function shapeOf(img: HTMLImageElement): Shape {
	return img.naturalHeight > 0 && img.naturalWidth / img.naturalHeight < 2.5 ? 'compact' : 'wide';
}

/**
 * The brand mark. Uses the store's logo (Storefront customisation in the
 * dashboard) when set, else the bundled `/logo.svg` wordmark, and falls back
 * to it when the store logo fails to load. A plain <img>, because store logos
 * are arbitrary sizes and SVGs. Square-ish logos get a taller box so a badge
 * doesn't shrink to a dot next to the nav.
 */
export function Logo({ src, className, inverted = false }: { src?: string | null; className?: string; inverted?: boolean }) {
	const [failed, setFailed] = useState(false);
	const [shape, setShape] = useState<Shape>('wide');
	const url = src && !failed ? src : FALLBACK;
	// An SSR'd <img> can load or fail before hydration attaches its handlers: check on mount too.
	const ref = useCallback(
		(img: HTMLImageElement | null) => {
			if (!img || url === FALLBACK || !img.complete) return;
			if (img.naturalWidth === 0) setFailed(true);
			else setShape(shapeOf(img));
		},
		[url],
	);
	return (
		<img
			ref={ref}
			src={url}
			alt={siteConfig.name}
			onLoad={url === FALLBACK ? undefined : (e) => setShape(shapeOf(e.currentTarget))}
			onError={url === FALLBACK ? undefined : () => setFailed(true)}
			className={clsx(
				'w-auto max-w-[16rem] object-contain object-left select-none',
				shape === 'compact' ? 'h-10 sm:h-12' : 'h-6 sm:h-8',
				inverted && url === FALLBACK ? 'invert' : null,
				className,
			)}
			draggable={false}
		/>
	);
}
