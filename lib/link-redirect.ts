/**
 * The backend's magic links point at `/account/appointments/{id}/view(?action=...)`.
 * This template's booking page is `/account/appointments/{id}`: strip the
 * `/view` segment and keep any query (e.g. `?action=cancel`). Order links go to
 * the account home.
 */
export function normalizeRedirect(path: string): string {
	const appt = path.match(/^\/account\/appointments\/([^/?#]+)(?:\/view)?(\?.*)?$/);
	if (appt) return `/account/appointments/${appt[1]}${appt[2] ?? ''}`;
	if (/^\/account\/orders(\/|$|\?)/.test(path)) return '/account';
	return path;
}
