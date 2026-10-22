import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { siteConfig } from '@/lib/site-config';

export interface FooterStudio {
	key: string;
	name: string;
	address: string;
}

/**
 * Ink footer: studios with addresses, the two link columns, contact from the
 * store settings (falling back to siteConfig.contact). A Server Component.
 */
export function Footer({
	logo,
	studios,
	email,
	phone,
}: {
	logo?: string | null;
	studios: FooterStudio[];
	email: string;
	phone: string;
}) {
	const year = new Date().getFullYear();
	return (
		<footer className="bg-ink text-paper">
			<div className="container-x pt-20 pb-10">
				<div className="grid gap-12 lg:grid-cols-12">
					<div className="lg:col-span-4">
						<Logo src={logo} inverted className="h-7" />
						<p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-paper/70">{siteConfig.footer.description}</p>
						<p className="eyebrow mt-8 text-paper/50">{siteConfig.tagline}</p>
					</div>

					<div className="lg:col-span-4">
						<p className="eyebrow text-paper/50">Studios</p>
						<ul className="mt-5 space-y-5">
							{studios.map((s) => (
								<li key={s.key}>
									<Link href={`/studios/${s.key}`} className="headline text-lg text-paper hover:underline">
										{s.name}
									</Link>
									<p className="tabular mt-1 text-[0.78rem] text-paper/60">{s.address}</p>
								</li>
							))}
						</ul>
					</div>

					<div className="grid grid-cols-2 gap-8 lg:col-span-4">
						<div>
							<p className="eyebrow text-paper/50">Book</p>
							<ul className="mt-5 space-y-2.5">
								{siteConfig.footer.exploreLinks.map((l) => (
									<li key={l.href}>
										<Link href={l.href} className="text-paper/80 hover:text-paper">
											{l.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div>
							<p className="eyebrow text-paper/50">Tensile</p>
							<ul className="mt-5 space-y-2.5">
								{siteConfig.footer.companyLinks.map((l) => (
									<li key={l.href}>
										<Link href={l.href} className="text-paper/80 hover:text-paper">
											{l.label}
										</Link>
									</li>
								))}
								{siteConfig.footer.socials.map((s) => (
									<li key={s.href}>
										<a href={s.href} target="_blank" rel="noopener noreferrer" className="text-paper/80 hover:text-paper">
											{s.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<span aria-hidden className="mt-16 block h-px w-full bg-paper/15" />

				<div className="mt-6 flex flex-col gap-3 text-[0.8rem] text-paper/55 sm:flex-row sm:items-center sm:justify-between">
					<div className="tabular flex flex-wrap gap-x-6 gap-y-1">
						<a href={`mailto:${email}`} className="hover:text-paper">
							{email}
						</a>
						<a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-paper">
							{phone}
						</a>
					</div>
					<p className="tabular">
						© {year} {siteConfig.name} · Booking by{' '}
						<a href="https://opencals.com" target="_blank" rel="noopener noreferrer" className="hover:text-paper">
							Opencals
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
