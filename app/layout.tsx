import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { siteConfig } from '@/lib/site-config';
import { storeContact } from '@/lib/contact';
import { physicalStudios } from '@/lib/catalog';
import { getCatalog, getLocations, getStoreSettings, storeImages } from '@/lib/server-data';
import './globals.css';

// Variable Archivo with the width axis: display type runs expanded (wdth 112–125).
const archivo = Archivo({
	subsets: ['latin', 'latin-ext'],
	axes: ['wdth'],
	variable: '--font-archivo',
	display: 'swap',
});
const plexMono = IBM_Plex_Mono({
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '500', '600'],
	variable: '--font-plex-mono',
	display: 'swap',
});

const title = `${siteConfig.name} | Reformer Pilates in Berlin`;

export const metadata: Metadata = {
	title: {
		default: title,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	applicationName: siteConfig.name,
	keywords: [
		'reformer pilates Berlin',
		'pilates Mitte',
		'pilates Kreuzberg',
		'pilates Prenzlauer Berg',
		'reformer class',
		'private pilates session',
		'prenatal pilates Berlin',
	],
	openGraph: {
		title,
		description: siteConfig.description,
		siteName: siteConfig.name,
		locale: siteConfig.locale,
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description: siteConfig.description,
	},
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: '#EDEBE6',
	colorScheme: 'light',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [initialSettings, catalog, locations] = await Promise.all([getStoreSettings(), getCatalog(), getLocations()]);
	const { logo, banner } = storeImages(initialSettings);
	const { email, phone } = storeContact(initialSettings);
	const studios = physicalStudios(catalog);
	const physical = locations.filter((l) => l.type === siteConfig.locationTypes.physical);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ExerciseGym',
		name: initialSettings?.name || siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		...(logo ? { logo } : {}),
		...(banner ? { image: banner } : {}),
		telephone: phone,
		email,
		sameAs: [siteConfig.contact.instagram],
		location: physical.map((l) => ({
			'@type': 'SportsActivityLocation',
			name: l.title,
			url: `${siteConfig.url}/studios/${studios.find((s) => s.id === l.id)?.key ?? l.slug}`,
			address: {
				'@type': 'PostalAddress',
				streetAddress: [l.addressLine1, l.addressLine2].filter(Boolean).join(', '),
				addressLocality: l.city,
				postalCode: l.postalCode,
				addressCountry: l.country,
			},
			...(l.latitude && l.longitude ? { geo: { '@type': 'GeoCoordinates', latitude: l.latitude, longitude: l.longitude } } : {}),
		})),
	};

	return (
		<html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
			<body>
				<Providers initialSettings={initialSettings}>
					<ScrollProgress />
					<Header logo={logo} studios={studios.map((s) => ({ key: s.key, name: s.short }))} />
					<main>{children}</main>
					<Footer logo={logo} email={email} phone={phone} studios={studios.map((s) => ({ key: s.key, name: s.name, address: s.address }))} />
				</Providers>
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
			</body>
		</html>
	);
}
