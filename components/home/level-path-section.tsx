import { SectionIntro } from '@/components/home/section-intro';
import { LevelPath } from '@/components/home/level-path';

/** "Foundations to Tower": the level path section. `classKeys` = class types that exist in the store. */
export function LevelPathSection({ classKeys }: { classKeys: string[] }) {
	return (
		<section aria-labelledby="levels-title" className="container-x section-y">
			<SectionIntro
				id="levels-title"
				index="04"
				eyebrow="The level path"
				title={
					<>
						Foundations <em>to Tower.</em>
					</>
				}
				intro="Four steps, each a little heavier than the last. It’s guidance, not a gate: your account counts your classes and shows where you are, and you can always book what you like."
			/>
			<LevelPath available={classKeys} />
		</section>
	);
}
