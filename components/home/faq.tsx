import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion';
import { Reveal } from '@/components/motion/reveal';
import { formatGap } from '@/lib/policy';
import { siteConfig, type StudioMeta } from '@/lib/site-config';

function roomSizes(): string {
	const rooms = Object.values(siteConfig.studios as Record<string, StudioMeta>).flatMap((s) =>
		s.rooms.filter((r) => !r.private).map((r) => `${r.beds} in the ${s.short} ${r.name}`),
	);
	return rooms.join(', ');
}

/** Questions people ask before a first class. Every policy number comes from site-config. */
function faqItems(): FaqItem[] {
	const { policies, springs, classes, introOffer } = siteConfig;
	const sizes = roomSizes();
	return [
		{
			q: 'I’ve never been on a reformer. Where do I start?',
			a: `${classes.foundations.short}. ${classes.foundations.tagline} After one class you can book ${classes.flow.short}.`,
		},
		{
			q: 'How many people are in a class?',
			a: sizes ? `Never more than the beds in the room: ${sizes}.` : 'Never more than the beds in the room.',
		},
		{
			q: 'What do the spring colours mean?',
			a: `They’re our intensity scale: ${springs.green.intensity.toLowerCase()} green, ${springs.yellow.intensity.toLowerCase()} yellow, ${springs.blue.intensity.toLowerCase()} blue and ${springs.red.intensity.toLowerCase()} red. Every class shows its spring on the timetable.`,
		},
		{
			q: 'What should I bring?',
			a: 'Grip socks and water. Socks are required on the reformer; you can add a pair when you book. Arrive ten minutes early for your first class.',
		},
		{
			q: 'Can I cancel or move a class?',
			a: `Yes, up to ${formatGap(policies.cancelHours * 3600)} before it starts, from your account. You can book up to ${policies.bookingWindowDays} days ahead.`,
		},
		{
			q: 'Can I come when I’m pregnant?',
			a: `Book ${classes.prenatal.short}. ${classes.prenatal.prerequisite ?? ''}`.trim(),
		},
		{
			q: 'Is there an offer for new people?',
			a: introOffer.body,
		},
		{
			q: 'Can I train from home?',
			a: `${siteConfig.studios['tensile-at-home'].blurb} The Join button appears in your account ${siteConfig.joinWindowMinutes} minutes before class.`,
		},
	];
}

export function Faq({ email }: { email: string }) {
	return (
		<section aria-labelledby="faq-title" className="container-x section-y grid gap-12 lg:grid-cols-12">
			<Reveal className="lg:col-span-4">
				<p className="eyebrow flex items-center gap-3 text-graphite">
					<span className="tabular">09</span>
					<span aria-hidden className="h-px w-8 bg-concrete" />
					Questions
				</p>
				<h2 id="faq-title" className="display-md mt-5 text-ink">
					Before <em>you book.</em>
				</h2>
				<p className="mt-5 leading-relaxed text-graphite">
					Anything else, write to{' '}
					<a href={`mailto:${email}`} className="link-underline text-ink">
						{email}
					</a>
					.
				</p>
			</Reveal>
			<div className="lg:col-span-8">
				<FaqAccordion items={faqItems()} />
			</div>
		</section>
	);
}
