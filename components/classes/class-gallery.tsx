import { clsx } from 'clsx';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { RevealImage } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';
import type { Spring } from '@/lib/site-config';

/**
 * Class images from the store (`ClassType.images`, built with
 * `getProductGallery`): a lead image and up to two more. With none, one
 * placeholder panel with the spring coil, so the layout never collapses.
 */
export function ClassGallery({ images, title, spring }: { images: string[]; title: string; spring: Spring }) {
	const shown = images.slice(0, 3);
	if (shown.length === 0) {
		return (
			<div className="image-placeholder flex aspect-[16/9] items-center justify-center rounded-[4px]">
				<SpringCoil spring={spring} coils={9} className="h-6 opacity-70" />
			</div>
		);
	}
	return (
		<div className={clsx('grid gap-3', shown.length > 1 ? 'md:grid-cols-[2fr_1fr]' : null)}>
			{shown.map((src, i) => (
				<RevealImage
					key={src}
					delay={i * 0.08}
					className={clsx(
						'image-placeholder rounded-[4px]',
						i === 0 ? 'aspect-[4/3] md:aspect-auto md:min-h-[26rem]' : 'aspect-[4/3]',
						i === 0 && shown.length > 2 ? 'md:row-span-2' : null,
					)}
				>
					<SafeImage
						src={src}
						alt={i === 0 ? title : `${title}, photo ${i + 1}`}
						fill
						priority={i === 0}
						sizes={i === 0 ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 30vw, 100vw'}
						className="object-cover"
					/>
				</RevealImage>
			))}
		</div>
	);
}
