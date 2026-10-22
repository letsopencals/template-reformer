import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { physicalStudios } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const entry = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({
		url: `${base}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	});

	const catalog = await getCatalog();

	return [
		entry('', 1),
		entry('/timetable', 0.95, 'daily'),
		entry('/classes', 0.9),
		entry('/studios', 0.8),
		entry('/instructors', 0.8),
		entry('/privates', 0.8),
		entry('/workshops', 0.8),
		...catalog.classTypes.map((c) => entry(`/classes/${c.key}`, 0.85)),
		...physicalStudios(catalog).map((s) => entry(`/studios/${s.key}`, 0.8)),
		...catalog.instructors.map((i) => entry(`/instructors/${i.slug}`, 0.7)),
	];
}
