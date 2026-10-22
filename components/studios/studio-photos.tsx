import { RevealImage } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';

/** The studio's two template photos (`public/images/studios/<key>-1/2.jpg`), offset like a contact sheet. */
export function StudioPhotos({ images, name }: { images: string[]; name: string }) {
	const [first, second] = [images[0] ?? null, images[1] ?? null];
	return (
		<div className="grid gap-3 md:grid-cols-[3fr_2fr] md:items-end">
			<RevealImage className="image-placeholder aspect-[4/3] rounded-[4px] md:aspect-[16/11]">
				<SafeImage src={first} alt={`${name}: the main room`} fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
			</RevealImage>
			<RevealImage className="image-placeholder aspect-[4/3] rounded-[4px] md:aspect-[4/5] md:-mb-10" delay={0.1} from="left">
				<SafeImage src={second} alt={`${name}: detail`} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
			</RevealImage>
		</div>
	);
}
