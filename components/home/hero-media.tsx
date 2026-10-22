'use client';

import { useEffect, useRef } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';

const POSTER = '/images/hero/hero.jpg';
const VIDEO = '/videos/hero.mp4';

/**
 * The hero's moving picture: a muted, looping studio film over its poster.
 * Some browsers ignore the `muted` attribute on hydrated video, so the effect
 * sets the property and calls play() itself. Reduced motion → poster only.
 */
export function HeroMedia() {
	const reduce = useReducedMotion();
	const ref = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || reduce) return;
		el.muted = true;
		el.play().catch(() => {
			// Autoplay refused (data saver, low power): the poster stays.
		});
	}, [reduce]);

	return (
		<div aria-hidden className="image-placeholder absolute inset-0">
			<SafeImage src={POSTER} alt="" fill priority sizes="100vw" className="object-cover" />
			{reduce ? null : (
				<video
					ref={ref}
					className="absolute inset-0 h-full w-full object-cover"
					src={VIDEO}
					poster={POSTER}
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
					disablePictureInPicture
				/>
			)}
		</div>
	);
}
