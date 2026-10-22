import { Reveal } from '@/components/motion/reveal';
import { TensionCable } from '@/components/motifs/tension-cable';
import { SectionIntro } from '@/components/home/section-intro';
import { formatGap } from '@/lib/policy';
import { siteConfig } from '@/lib/site-config';

interface Step {
	label: string;
	title: string;
	body: string;
}

const STEPS: Step[] = [
	{
		label: 'Before',
		title: 'Book Foundations',
		body: 'One class on the basics: the springs, the footbar, the straps and how to get on and off the carriage without thinking about it.',
	},
	{
		label: '−10 min',
		title: 'Arrive ten minutes early',
		body: 'Tell the desk it’s your first time. Your teacher sets your springs, moves the footbar to your height and shows you the straps before anyone starts.',
	},
	{
		label: 'On the bed',
		title: 'Grip socks on',
		body: 'They’re required on the reformer. Bring your own, or add a pair when you book and pick them up at the desk. They’re yours to keep.',
	},
	{
		label: 'In class',
		title: 'Slow, then shaking',
		body: 'Controlled moves at a steady pace. Your legs will shake around minute thirty; that’s the springs doing their job. Go lighter whenever you need to.',
	},
];

/** "Your first class": how it works, step by step, on a tension cable. */
export function FirstClass() {
	const cancel = formatGap(siteConfig.policies.cancelHours * 3600);
	return (
		<section aria-labelledby="first-title" className="container-x section-y">
			<SectionIntro
				id="first-title"
				index="08"
				eyebrow="Your first class"
				title={
					<>
						What happens <em>on day one.</em>
					</>
				}
				intro={`No experience needed, and no one expects you to know the words. Plans change: cancel or move a class up to ${cancel} before it starts.`}
			/>
			<div className="relative mt-12 lg:mt-16">
				<TensionCable className="absolute top-[0.45rem] left-0 max-lg:hidden" />
				<ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					{STEPS.map((s, i) => (
						<Reveal as="li" key={s.title} delay={i * 0.08} className="relative lg:pt-8">
							<span aria-hidden className="absolute top-0 left-0 h-4 w-4 rounded-[2px] border border-ink bg-plaster max-lg:hidden" />
							<p className="eyebrow flex items-center gap-2 text-steel">
								<span className="tabular text-ink">0{i + 1}</span>
								<span aria-hidden>·</span>
								{s.label}
							</p>
							<h3 className="headline mt-3 text-xl text-ink">{s.title}</h3>
							<p className="mt-2 leading-relaxed text-graphite">{s.body}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
