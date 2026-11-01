import { Reveal, RevealText } from '@/components/motion/reveal';
import type { PendingReason } from '@/lib/booking-status';
import { formatDue } from '@/components/confirmation/payment-instructions';

const COUNT_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

function lead(count: number): string {
	if (count <= 1) return 'Your bed is held.';
	return `${COUNT_WORDS[count] ?? count} beds held.`;
}

const COPY: Record<'booked' | PendingReason, { eyebrow: string; title: string; dot: string }> = {
	booked: { eyebrow: 'Booked', title: 'You’re on\nthe reformer.', dot: 'bg-spring-green' },
	awaiting_payment: { eyebrow: 'Received · awaiting payment', title: 'Pay to keep\nyour bed.', dot: 'bg-spring-yellow' },
	awaiting_approval: { eyebrow: 'Received · awaiting the studio’s confirmation', title: 'Booking\nreceived.', dot: 'bg-spring-yellow' },
};

function waitingLine(reason: PendingReason, count: number, dueAt: string | null): string {
	if (reason === 'awaiting_payment') {
		const due = formatDue(dueAt);
		return `${count > 1 ? 'Your beds are' : 'Your bed is'} held until your payment arrives${due ? ` (due ${due})` : ''}.`;
	}
	return 'The studio still has to confirm it. We’ll email you as soon as they do.';
}

/** Top of the confirmation page: order number, the headline, where the email went. */
export function ConfirmationHero({
	orderName,
	email,
	count,
	pendingReason = null,
	dueAt = null,
}: {
	orderName: string | null;
	email: string | null;
	count: number;
	/** Set only when the booking waits (pending with a reason); null reads as Booked. */
	pendingReason?: PendingReason | null;
	dueAt?: string | null;
}) {
	const copy = COPY[pendingReason ?? 'booked'];
	return (
		<header>
			<Reveal>
				<p className="eyebrow flex items-center gap-3 text-graphite">
					<span aria-hidden className={`inline-block h-2 w-2 rounded-[1px] ${copy.dot}`} />
					{orderName ? `${copy.eyebrow} · Order ${orderName}` : copy.eyebrow}
				</p>
			</Reveal>
			<RevealText key={copy.title} as="h1" text={copy.title} trigger="mount" className="display-lg mt-5 text-ink" lineClassName="pb-[0.05em]" />
			<Reveal delay={0.2}>
				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">
					{pendingReason ? waitingLine(pendingReason, count, dueAt) : lead(count)}{' '}
					{email ? (
						<>
							{pendingReason ? 'The details are on their way to' : 'A confirmation is on its way to'} <span className="text-ink">{email}</span>.
						</>
					) : pendingReason ? (
						'The details are on their way by email.'
					) : (
						'A confirmation is on its way by email.'
					)}
				</p>
			</Reveal>
			<span aria-hidden className="cable cable-draw mt-10" />
		</header>
	);
}
