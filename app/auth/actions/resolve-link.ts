'use server';

import '@/lib/opencals';
import { AuthService, type MagicLinkErrorCode } from '@opencals/storefront-sdk';
import { signIn } from '@/lib/auth';

export type ResolveLinkResult = {
	success: boolean;
	error?: string;
	errorCode?: MagicLinkErrorCode;
	redirectPath?: string;
};

const MAGIC_LINK_ERROR_CODES: ReadonlySet<string> = new Set<MagicLinkErrorCode>(['TOKEN_INVALID', 'TOKEN_USED', 'TOKEN_EXPIRED']);

/** The `code` a failed resolve sends (on OpencalsApiError, or on the raw error body), when it is a magic-link one. */
function magicLinkCode(err: unknown): MagicLinkErrorCode | null {
	const code = err && typeof err === 'object' && 'code' in err ? (err as { code: unknown }).code : undefined;
	return typeof code === 'string' && MAGIC_LINK_ERROR_CODES.has(code) ? (code as MagicLinkErrorCode) : null;
}

/**
 * Resolves a magic-link token (`/link/{token}`). For most purposes the backend
 * returns session tokens and we sign the customer in; reset-password returns no
 * tokens and only a redirect path carrying the token as a query param.
 */
export async function resolveLink(token: string): Promise<ResolveLinkResult> {
	try {
		// The SDK's error interceptor throws OpencalsApiError, but depending on the
		// client's throwOnError config a failed call may instead resolve with a
		// populated `error`. Handle both so error classification always runs.
		const { data, error } = await AuthService.resolveLink({ query: { token } });
		if (error || !data) throw error ?? new Error('Invalid link');

		if (data.accessToken) {
			await signIn('magic-link', {
				accessToken: data.accessToken,
				refreshToken: data.refreshToken,
				redirect: false,
			});
		}

		return { success: true, redirectPath: data.redirectPath };
	} catch (err) {
		const message =
			err && typeof err === 'object' && 'message' in err
				? String((err as { message: unknown }).message)
				: 'Invalid link';
		// The API says why in `code`; the message text is the fallback for a body without one.
		let errorCode = magicLinkCode(err);
		if (!errorCode) {
			errorCode = 'TOKEN_INVALID';
			if (message.includes('expired')) errorCode = 'TOKEN_EXPIRED';
			else if (message.includes('used')) errorCode = 'TOKEN_USED';
		}
		return { success: false, error: message, errorCode };
	}
}
