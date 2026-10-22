import { Reveal, RevealText } from '@/components/motion/reveal';

const COUNT_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

function lead(count: number): string {
	if (count <= 1) return 'Your bed is held.';
	return `${COUNT_WORDS[count] ?? count} beds held.`;
}

/** Top of the confirmation page: order number, the headline, where the email went. */
export function ConfirmationHero({ orderName, email, count }: { orderName: string | null; email: string | null; count: number }) {
	return (
		<header>
			<Reveal>
				<p className="eyebrow flex items-center gap-3 text-graphite">
					<span aria-hidden className="inline-block h-2 w-2 rounded-[1px] bg-spring-green" />
					{orderName ? `Booked · Order ${orderName}` : 'Booked'}
				</p>
			</Reveal>
			<RevealText as="h1" text={'You’re on\nthe reformer.'} trigger="mount" className="display-lg mt-5 text-ink" lineClassName="pb-[0.05em]" />
			<Reveal delay={0.2}>
				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">
					{lead(count)}{' '}
					{email ? (
						<>
							A confirmation is on its way to <span className="text-ink">{email}</span>.
						</>
					) : (
						'A confirmation is on its way by email.'
					)}
				</p>
			</Reveal>
			<span aria-hidden className="cable cable-draw mt-10" />
		</header>
	);
}
