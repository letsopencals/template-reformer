import type { StorePublicSettings } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';

/** Contact details from the store's settings, falling back to `siteConfig.contact`. */
export function storeContact(settings: StorePublicSettings | null | undefined) {
	const info = settings?.contactInfo;
	return {
		email: info?.contactEmail || siteConfig.contact.email,
		phone: info?.contactPhoneNumbers?.[0] || siteConfig.contact.phone,
	};
}
