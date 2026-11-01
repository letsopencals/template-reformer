import { clsx } from 'clsx';
import type { PaymentInstructions as Instructions } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';

const DUE = new Intl.DateTimeFormat('en-GB', {
	timeZone: siteConfig.timezone,
	weekday: 'short',
	day: 'numeric',
	month: 'short',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
});

/** "Tue 3 Nov, 18:00" in studio time, or null for a missing / unreadable date. */
export function formatDue(iso: string | null | undefined): string | null {
	if (!iso) return null;
	const ms = Date.parse(iso);
	return Number.isNaN(ms) ? null : DUE.format(ms).replace(',', '');
}

function safeInvoiceUrl(url: string | null | undefined): string | null {
	return typeof url === 'string' && url.startsWith('https://') ? url : null;
}

interface PaymentInstructionsProps {
	/** From checkout submit (this tab only); null after a reload elsewhere. */
	instructions: Instructions | null;
	/** Shown as the transfer reference: the order number. */
	orderName: string | null;
	/** The order still waits on a manual payment, but the details weren't handed over: point to the email. */
	emailFallback: boolean;
	className?: string;
}

/**
 * How to pay a booking placed without a card: the bank account to transfer to,
 * the Stripe invoice link, or the front desk, with the deadline. A printed
 * slip like the pass, in the studio's ink.
 */
export function PaymentInstructions({ instructions, orderName, emailFallback, className }: PaymentInstructionsProps) {
	if (!instructions) {
		if (!emailFallback) return null;
		return (
			<section aria-label="How to pay" className={clsx('rounded-[4px] border border-line bg-paper p-6', className)}>
				<h2 className="eyebrow text-steel">How to pay</h2>
				<p className="mt-3 text-sm leading-relaxed text-ink">Payment is still due. Check your email for the payment details.</p>
			</section>
		);
	}

	const due = formatDue(instructions.dueAt);
	const invoiceUrl = safeInvoiceUrl(instructions.hostedInvoiceUrl);
	const bank = instructions.bankDetails;
	const bankRows: [string, string | null | undefined][] = bank
		? [
				['Account name', bank.accountName],
				['Bank', bank.bankName],
				['IBAN / account', bank.iban],
				['SWIFT / BIC', bank.swift],
				['Reference', orderName],
			]
		: [];
	const shownBankRows = bankRows.filter((r): r is [string, string] => Boolean(r[1]));

	return (
		<section aria-label="How to pay" className={clsx('rounded-[4px] border border-ink bg-paper p-6 shadow-card', className)}>
			<div className="flex items-baseline justify-between gap-3">
				<h2 className="eyebrow text-steel">How to pay</h2>
				{due ? <span className="eyebrow text-spring-red">Due {due}</span> : null}
			</div>

			{instructions.provider === 'stripe_invoice' ? (
				<>
					<p className="headline mt-4 text-[1.2rem] text-ink">Pay by invoice</p>
					<p className="mt-2 text-sm leading-relaxed text-graphite">
						{invoiceUrl ? 'Pay online with card or bank on the invoice page. A copy is in your email.' : 'Your invoice is on its way by email. Pay it from the link there.'}
					</p>
					{invoiceUrl ? (
						<a
							href={invoiceUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
						>
							Pay invoice <span aria-hidden>↗</span>
						</a>
					) : null}
				</>
			) : instructions.provider === 'bank_transfer' ? (
				<>
					<p className="headline mt-4 text-[1.2rem] text-ink">Bank transfer</p>
					{shownBankRows.length ? (
						<dl className="mt-4 divide-y divide-line border-y border-line text-sm">
							{shownBankRows.map(([label, value]) => (
								<div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
									<dt className="text-graphite">{label}</dt>
									<dd className="tabular text-right break-all text-ink select-all">{value}</dd>
								</div>
							))}
						</dl>
					) : (
						<p className="mt-2 text-sm leading-relaxed text-graphite">The transfer details are in your confirmation email.</p>
					)}
				</>
			) : instructions.provider === 'cash' ? (
				<>
					<p className="headline mt-4 text-[1.2rem] text-ink">Pay at the studio</p>
					<p className="mt-2 text-sm leading-relaxed text-graphite">Pay at the front desk when you arrive, card or cash.</p>
				</>
			) : (
				<p className="mt-4 text-sm leading-relaxed text-graphite">Payment is still due. Your confirmation email says how to pay.</p>
			)}

			{due ? <p className="mt-4 text-xs leading-relaxed text-graphite">Unpaid bookings are released after the due time.</p> : null}
		</section>
	);
}
