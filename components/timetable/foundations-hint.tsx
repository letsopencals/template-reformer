import { SpringCoil } from '@/components/motifs/spring-chip';
import { siteConfig } from '@/lib/site-config';

/** Newcomer nudge: one tap filters to Foundations. */
export function FoundationsHint({ onPick }: { onPick: () => void }) {
	return (
		<div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
			<SpringCoil spring="green" />
			<p className="text-graphite">
				New to reformer?{' '}
				<button
					type="button"
					onClick={onPick}
					className="font-medium text-ink link-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
				>
					Start with Foundations <span aria-hidden>→</span>
				</button>
			</p>
			<p className="tabular text-xs text-steel">
				{siteConfig.introOffer.title}: {siteConfig.introOffer.headline.toLowerCase()}
			</p>
		</div>
	);
}
