import { siteConfig, type StudioMeta } from '@/lib/site-config';

/** In-studio locations from site-config (slug + short key), for "not tried yet". */
export function physicalStudioKeys(): { slug: string; key: string }[] {
	return Object.entries(siteConfig.studios as Record<string, StudioMeta>)
		.filter(([, meta]) => !meta.online)
		.map(([slug, meta]) => ({ slug, key: meta.key }));
}
