import { clsx } from 'clsx';

/** Hairline message strip for auth, checkout and account forms. */
export function Notice({
	tone = 'error',
	children,
	className,
}: {
	tone?: 'error' | 'success' | 'info';
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={clsx(
				'flex items-start gap-3 rounded-[2px] border px-4 py-3 text-sm leading-relaxed',
				tone === 'error' && 'border-spring-red/40 bg-spring-red-soft text-ink',
				tone === 'success' && 'border-spring-green/40 bg-spring-green-soft text-ink',
				tone === 'info' && 'border-line bg-paper text-graphite',
				className,
			)}
		>
			<span
				aria-hidden
				className={clsx(
					'mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-[1px]',
					tone === 'error' && 'bg-spring-red',
					tone === 'success' && 'bg-spring-green',
					tone === 'info' && 'bg-steel',
				)}
			/>
			<div>{children}</div>
		</div>
	);
}

/** Carriage spinner: a small block sliding along a rail. */
export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
	return (
		<span role="status" aria-label={label} className={clsx('relative inline-block h-3 w-16', className)}>
			<span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-concrete" />
			<span className="absolute top-1/2 left-0 h-3 w-4 -translate-y-1/2 animate-[carriage-shuttle_1.1s_var(--ease-carriage)_infinite_alternate] rounded-[2px] bg-ink" />
		</span>
	);
}

/** Full-screen loading fallback for Suspense boundaries on auth pages. */
export function AuthFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-plaster">
			<Spinner />
		</div>
	);
}

/** Field label class (mono caption). */
export const FIELD_LABEL = 'eyebrow mb-2.5 block text-graphite';
