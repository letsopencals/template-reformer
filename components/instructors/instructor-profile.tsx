import Link from 'next/link';
import { SpringCoil } from '@/components/motifs/spring-chip';
import { Reveal, RevealImage } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';
import type { Spring } from '@/lib/site-config';

export interface InstructorProfileData {
	name: string;
	image: string | null;
	bio: string | null;
	story: string | null;
	languages: string[];
	specialities: string[];
	instagram: string | null;
	studios: Array<{ key: string; short: string }>;
	classes: Array<{ key: string; short: string; spring: Spring }>;
}

const LINK = 'link-underline text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

/** Portrait, story and the facts (languages, specialities, studios, classes) for one teacher. */
export function InstructorProfile({ data: d }: { data: InstructorProfileData }) {
	return (
		<div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-16">
			<RevealImage className="image-placeholder aspect-[4/5] rounded-[4px] md:sticky md:top-28 md:self-start">
				<SafeImage src={d.image} alt={`${d.name}, portrait`} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
			</RevealImage>
			<div>
				{d.bio ? <p className="headline text-2xl leading-snug text-ink md:text-3xl">{d.bio}</p> : null}
				{d.story ? <p className="mt-6 max-w-prose text-lg leading-relaxed text-graphite">{d.story}</p> : null}
				<Reveal>
					<dl className="mt-10 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2">
						<div>
							<dt className="eyebrow text-steel">Teaches in</dt>
							<dd className="tabular mt-2 text-ink">{d.languages.length ? d.languages.join(' · ') : '—'}</dd>
						</div>
						<div>
							<dt className="eyebrow text-steel">Studios</dt>
							<dd className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
								{d.studios.length
									? d.studios.map((s) =>
											s.key === 'online' ? (
												<span key={s.key} className="text-ink">{s.short}</span>
											) : (
												<Link key={s.key} href={`/studios/${s.key}`} className={LINK}>
													{s.short}
												</Link>
											),
										)
									: '—'}
							</dd>
						</div>
						<div className="sm:col-span-2">
							<dt className="eyebrow text-steel">Classes</dt>
							<dd className="mt-3 flex flex-wrap gap-2">
								{d.classes.length
									? d.classes.map((c) => (
											<Link
												key={c.key}
												href={`/classes/${c.key}`}
												className="inline-flex items-center gap-2 rounded-[2px] border border-line bg-paper px-3 py-1.5 font-mono text-[0.7rem] tracking-[0.08em] text-ink uppercase transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-ink"
											>
												<SpringCoil spring={c.spring} />
												{c.short}
											</Link>
										))
									: '—'}
							</dd>
						</div>
						{d.specialities.length ? (
							<div className="sm:col-span-2">
								<dt className="eyebrow text-steel">Specialities</dt>
								<dd className="mt-2 text-ink">{d.specialities.join(', ')}</dd>
							</div>
						) : null}
						{d.instagram ? (
							<div>
								<dt className="eyebrow text-steel">Instagram</dt>
								<dd className="mt-2">
									<a href={d.instagram} target="_blank" rel="noopener noreferrer" className={LINK}>
										{d.instagram.replace(/^https?:\/\/(www\.)?/, '')} ↗<span className="sr-only"> (opens in a new tab)</span>
									</a>
								</dd>
							</div>
						) : null}
					</dl>
				</Reveal>
			</div>
		</div>
	);
}
