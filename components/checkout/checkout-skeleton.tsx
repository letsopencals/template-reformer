export function CheckoutSkeleton() {
	return (
		<div className="mt-10 grid gap-16 lg:grid-cols-12" aria-busy="true" aria-label="Loading your booking">
			<div className="space-y-6 lg:col-span-7">
				<div className="image-placeholder h-8 w-2/3" />
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-8 w-1/2" />
			</div>
			<div className="hidden lg:col-span-5 lg:block">
				<div className="image-placeholder h-64" />
			</div>
		</div>
	);
}
