import type { ReactNode } from 'react';

/** Editorial field label: eyebrow caption, optional required mark and helper copy. */
export function Field({
	htmlFor,
	label,
	required,
	hint,
	children,
}: {
	htmlFor: string;
	label: ReactNode;
	required?: boolean;
	hint?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div>
			<label htmlFor={htmlFor} className="eyebrow mb-2.5 block text-[0.62rem] text-graphite">
				{label}
				{required ? (
					<span className="ml-1 text-spring-red" aria-hidden>
						*
					</span>
				) : null}
			</label>
			{hint ? (
				<p id={`${htmlFor}-hint`} className="-mt-1 mb-2.5 text-xs leading-relaxed text-graphite">
					{hint}
				</p>
			) : null}
			{children}
		</div>
	);
}
