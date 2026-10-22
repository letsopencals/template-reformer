import { PageHeading } from '@/components/ui/page-heading';

/**
 * Placeholder body for routes the page agents haven't built yet. Delete the
 * import when the real page lands.
 */
export function StubPage({ eyebrow, title, intro, owner, children }: { eyebrow?: string; title: string; intro?: string; owner: string; children?: React.ReactNode }) {
	return (
		<>
			<PageHeading eyebrow={eyebrow} title={title} intro={intro} />
			<div className="container-x pb-24">
				{children}
				<p className="eyebrow mt-10 text-steel">Placeholder · {owner}</p>
			</div>
		</>
	);
}
