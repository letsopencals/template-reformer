'use client';

import type { StorePublicSettings } from '@opencals/storefront-sdk';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/cart-context';
import { TimezoneProvider } from '@/contexts/timezone-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { SmoothScroll } from '@/components/motion/smooth-scroll';

export function Providers({
	children,
	initialSettings = null,
}: {
	children: React.ReactNode;
	initialSettings?: StorePublicSettings | null;
}) {
	return (
		<SessionProvider>
			<SettingsProvider initialSettings={initialSettings}>
				<TimezoneProvider>
					<CartProvider>
						<SmoothScroll>{children}</SmoothScroll>
					</CartProvider>
				</TimezoneProvider>
			</SettingsProvider>
		</SessionProvider>
	);
}
