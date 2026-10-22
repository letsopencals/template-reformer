import { Marquee } from '@/components/motion/marquee';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';

const IMAGES = Array.from({ length: 8 }, (_, i) => `/images/editorial/${i + 1}.jpg`);
const SHAPES = ['aspect-[4/5] w-56 sm:w-72', 'aspect-[3/2] w-72 sm:w-[26rem]', 'aspect-[1/1] w-60 sm:w-80', 'aspect-[3/4] w-52 sm:w-64'];

/**
 * A slow, pausable film strip of studio photography between the content
 * sections. Decorative (empty alts); the line above carries the meaning.
 */
export function EditorialBand() {
	return (
		<section aria-label="Inside the studios" className="section-y overflow-hidden border-y border-line bg-paper">
			<Reveal className="container-x flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<p className="display-sm max-w-2xl text-ink">
					North light, ash wood, black steel. <em>And a lot of shaking legs.</em>
				</p>
				<p className="eyebrow text-steel">Mitte · Kreuzberg · Prenzlauer Berg</p>
			</Reveal>
			<Marquee duration={70} className="mt-10 lg:mt-14" gapClassName="gap-4">
				{IMAGES.map((src, i) => (
					<div key={src} className={`image-placeholder relative shrink-0 overflow-hidden rounded-[4px] ${SHAPES[i % SHAPES.length]}`}>
						<SafeImage src={src} alt="" fill sizes="(min-width: 640px) 26rem, 18rem" className="object-cover" />
					</div>
				))}
			</Marquee>
		</section>
	);
}
