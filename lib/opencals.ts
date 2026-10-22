import { setupOpencals } from '@opencals/storefront-sdk';

setupOpencals({
	baseUrl: process.env.OPENCALS_API_URL ?? 'https://api.opencals.com',
	apiKey: process.env.OPENCALS_API_KEY,
	logging: process.env.NODE_ENV === 'development',
	// The SDK swallows HTTP errors unless this is set. Every route relies on throws:
	// catch OpencalsApiError and pass it through handleApiError (lib/api-error-handler.ts).
	throwOnError: true,
});
