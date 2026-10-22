import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/** The canonical text field: paper fill, 1px line, 2px radius, ink focus. */
export const FIELD_BASE =
	'w-full rounded-[2px] border border-line bg-paper px-4 py-3 text-[0.95rem] text-ink outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-steel hover:border-concrete focus:border-ink focus:bg-white focus:shadow-[0_0_0_3px_rgba(18,18,18,0.08)] aria-[invalid=true]:border-spring-red';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
	return <input ref={ref} className={clsx(FIELD_BASE, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
	{ className, ...props },
	ref,
) {
	return <textarea ref={ref} className={clsx(FIELD_BASE, 'min-h-28 resize-y', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
	{ className, children, ...props },
	ref,
) {
	return (
		<select
			ref={ref}
			className={clsx(
				FIELD_BASE,
				'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2012%208%27%3E%3Cpath%20d%3D%27M1%201.5l5%205%205-5%27%20fill%3D%27none%27%20stroke%3D%27%23121212%27%20stroke-width%3D%271.4%27/%3E%3C/svg%3E")] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-10',
				className,
			)}
			{...props}
		>
			{children}
		</select>
	);
});

/** Mono caption above a field. */
export function FieldLabel({ htmlFor, children, required, className }: { htmlFor?: string; children: React.ReactNode; required?: boolean; className?: string }) {
	return (
		<label htmlFor={htmlFor} className={clsx('eyebrow mb-2 block text-graphite', className)}>
			{children}
			{required ? <span className="ml-1 text-spring-red" aria-hidden>*</span> : null}
		</label>
	);
}
