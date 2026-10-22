import { Spinner } from '@/components/auth/auth-feedback';

/** Loading state shaped like a check-in pass. */
export function PassSkeleton({ label = 'Printing your pass' }: { label?: string }) {
	return (
		<div aria-busy className="overflow-hidden rounded-[4px] border border-line bg-paper">
			<div className="grid md:grid-cols-[1.1fr_1fr]">
				<div className="space-y-5 p-6 sm:p-8">
					<div className="h-3 w-32 animate-pulse rounded-[2px] bg-plaster-deep" />
					<div className="h-20 w-56 animate-pulse rounded-[2px] bg-plaster-deep" />
					<div className="h-3 w-48 animate-pulse rounded-[2px] bg-plaster-deep" />
					<div className="h-7 w-64 animate-pulse rounded-[2px] bg-plaster-deep" />
				</div>
				<div className="flex min-h-56 items-center justify-center bg-plaster-deep/60">
					<Spinner label={label} />
				</div>
			</div>
		</div>
	);
}
