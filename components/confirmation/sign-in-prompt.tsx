import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { RoomPlan } from '@/components/motifs/room-plan';
import { siteConfig } from '@/lib/site-config';

const SAMPLE_ROOM = siteConfig.studios['tensile-prenzlauer-berg'].rooms[0]!;

/**
 * Shown when checkout didn't sign the customer in (SDK 0.3.18 returns `auth`
 * only for trusted customers). The booking is safe; a code brings the pass here.
 */
export function SignInPrompt({ orderId }: { orderId: string | null }) {
	const back = orderId ? `/thank-you?orderId=${encodeURIComponent(orderId)}` : '/account';
	return (
		<div className="grid overflow-hidden rounded-[4px] border border-line bg-paper md:grid-cols-[1.3fr_1fr]">
			<div className="p-6 sm:p-8">
				<p className="eyebrow text-steel">Check-in pass</p>
				<h2 className="headline mt-4 text-2xl text-ink">Sign in with a code to manage this booking.</h2>
				<p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-graphite">
					Your bed is booked and the confirmation email is on its way. To see your pass here, move or cancel the class and follow your level path,
					sign in with the email you booked with. We send a 6-digit code; no password.
				</p>
				<div className="mt-7 flex flex-wrap items-center gap-4">
					<Link href={`/login?callbackUrl=${encodeURIComponent(back)}`} className={buttonClasses({ size: 'lg' })}>
						Email me a code
					</Link>
					<span className="text-sm text-graphite">Or tap the link in your confirmation email.</span>
				</div>
			</div>
			<div aria-hidden className="hidden items-center justify-center bg-plaster-deep/60 p-8 md:flex">
				<div className="w-full max-w-[240px] opacity-70">
					<RoomPlan room={SAMPLE_ROOM} showLabels={false} />
				</div>
			</div>
		</div>
	);
}
