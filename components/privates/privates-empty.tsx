import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

/** No private sessions in the catalog (or the store didn't load). */
export function PrivatesEmpty() {
	return (
		<div className="rounded-[4px] border border-line bg-paper p-8 sm:p-12">
			<p className="eyebrow text-steel">Privates</p>
			<p className="display-sm mt-3 max-w-xl text-ink">Private sessions aren’t bookable online right now.</p>
			<p className="mt-4 max-w-xl text-graphite">
				Write to <a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> and we’ll find you a time, or join a small group class in the meantime.
			</p>
			<Link href="/timetable" className={buttonClasses({ variant: 'outline', className: 'mt-8' })}>
				See the timetable
			</Link>
		</div>
	);
}
