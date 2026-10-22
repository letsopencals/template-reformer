import { siteConfig } from '@/lib/site-config';

export interface NavLink {
	label: string;
	href: string;
}

/** Main navigation (header bar + mobile menu). Studios is expanded per studio in the menu. */
export const NAV_LINKS: NavLink[] = siteConfig.nav;

/** True when `pathname` is inside `href`'s section. */
export function isActive(pathname: string, href: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname === href || pathname.startsWith(`${href}/`);
}
