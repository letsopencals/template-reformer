'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useNow } from '@/hooks/use-now';
import { siteConfig } from '@/lib/site-config';
import { CarriageRail } from '@/components/motifs/carriage-rail';
import { buildDayStrip, instructorsForSeries, teaches, type PrivateDeepLink, type PrivateStudioOption } from './private-model';
import { formatWhen, privateBookingBody } from './private-booking';
import { FIRST_AVAILABLE, initialWizard, STEPS, wizardReducer, type StepIndex } from './wizard-state';
import { usePrivateDayTimes, usePrivateOpenDays } from './use-private-times';
import { usePrivateAddOns } from './use-private-add-ons';
import { useAddToCart } from './use-add-to-cart';
import { WizardStep, type StepState } from './wizard-step';
import { StudioStep } from './studio-step';
import { FormatStep } from './format-step';
import { InstructorStep } from './instructor-step';
import { DayStrip } from './day-strip';
import { TimeGrid } from './time-grid';
import { AddOnsStep } from './add-ons-step';
import { PrivateSummary } from './private-summary';
import { MobileBookBar } from './mobile-book-bar';

function stateOf(i: number, step: StepIndex): StepState {
	return i === step ? 'active' : i < step ? 'done' : 'locked';
}

/** Studio → 1:1 or Duet → teacher → day and time → extras, with a live booking card. */
const NO_LINK: PrivateDeepLink = { studioId: null, format: null, instructorId: null };

export function PrivatesWizard({ studios, link = NO_LINK }: { studios: PrivateStudioOption[]; link?: PrivateDeepLink }) {
	const [s, dispatch] = useReducer(wizardReducer, undefined, () => {
		const st = studios.find((x) => x.id === link.studioId);
		const keep = st && link.format && teaches(st, st[link.format], link.instructorId);
		return initialWizard(link.studioId, link.format, keep ? link.instructorId : null);
	});
	const { currency } = useSettings();
	const now = useNow();
	const nowMs = now?.getTime() ?? null;

	const studio = studios.find((x) => x.id === s.studioId) ?? null;
	const series = studio && s.format ? studio[s.format] : null;
	const teachers = studio ? instructorsForSeries(studio, series) : [];
	const teacherId = s.instructor && s.instructor !== FIRST_AVAILABLE ? s.instructor : null;

	const target = { slug: series?.slug ?? null, staffMemberId: teacherId, locationId: studio?.id ?? null };
	const open = usePrivateOpenDays(target);
	const noDays = open.openDays !== null && open.openDays.size === 0;
	const days = useMemo(() => (nowMs ? buildDayStrip(nowMs, open.openDays) : []), [nowMs, open.openDays]);
	// Until a day is picked, show the first open one.
	const date = s.date ?? days.find((d) => d.open)?.date ?? null;
	const avail = usePrivateDayTimes({ ...target, date, now: nowMs });
	const extras = usePrivateAddOns({ slug: series?.slug ?? null, locationId: studio?.id ?? null, staffMemberId: teacherId });
	const time = avail.times.find((t) => t.key === s.timeKey) ?? null;

	// The picked time vanished on a refetch (someone else took the room): back to the times.
	const gone = Boolean(s.timeKey) && !time && !avail.loading && !avail.error && nowMs !== null;
	useEffect(() => {
		if (gone) dispatch({ type: 'timeGone' });
	}, [gone]);

	const refreshTimes = avail.refresh;
	const refreshDays = open.refresh;
	const onTaken = useCallback(() => {
		refreshTimes();
		void refreshDays();
		dispatch({ type: 'timeGone' });
	}, [refreshTimes, refreshDays]);
	const cart = useAddToCart({ onTaken });

	const bookedTeacher = teacherId ?? time?.staffIds[0] ?? null;
	const teacherName = teachers.find((t) => t.id === bookedTeacher)?.name ?? (s.instructor === FIRST_AVAILABLE ? 'First available' : null);
	const lines = extras.addOns.filter((a) => extras.selected.has(a.id)).map((a) => ({ label: `${a.title} × ${extras.selected.get(a.id)}`, amount: a.price * (extras.selected.get(a.id) ?? 0) }));

	const ready = Boolean(series && studio && time);
	const total = (series?.price ?? 0) + lines.reduce((sum, l) => sum + l.amount, 0);
	const book = () => {
		if (!series || !studio || !time) return;
		void cart.book(privateBookingBody({ series, studioId: studio.id, time, instructorId: teacherId, addOns: extras.selected }));
	};
	const edit = (step: StepIndex) => dispatch({ type: 'edit', step });
	const answers = [
		studio?.name ?? null,
		s.format ? siteConfig.privates.formats[s.format].label : null,
		teacherName,
		time ? formatWhen(time.key, series?.duration ?? 0) : null,
		extras.selected.size ? `${extras.selected.size} extra${extras.selected.size === 1 ? '' : 's'}` : 'No extras',
	];

	return (
		<div className="grid gap-10 pb-20 lg:grid-cols-12 lg:gap-14 lg:pb-0">
			<div className="lg:col-span-7">
				<div className="mb-8 flex items-center gap-4">
					<span className="eyebrow shrink-0 text-steel">
						Step {Math.min(s.step + 1, STEPS.length)} of {STEPS.length}
					</span>
					<CarriageRail value={s.step / STEPS.length} label="Booking progress" />
				</div>
				<WizardStep index={0} title="Studio" state={stateOf(0, s.step)} answer={answers[0]} onEdit={() => edit(0)}>
					<StudioStep studios={studios} selectedId={s.studioId} currency={currency} teacherId={link.instructorId} onPick={(id) => dispatch({ type: 'studio', id })} />
				</WizardStep>
				<WizardStep index={1} title="1:1 or Duet" state={stateOf(1, s.step)} answer={answers[1]} onEdit={() => edit(1)}>
					{studio ? <FormatStep studio={studio} selected={s.format} currency={currency} onPick={(format) => dispatch({ type: 'format', format, instructor: teaches(studio, studio[format], link.instructorId) ? link.instructorId : null })} /> : null}
				</WizardStep>
				<WizardStep index={2} title="Teacher" state={stateOf(2, s.step)} answer={answers[2]} onEdit={() => edit(2)}>
					<InstructorStep instructors={teachers} selected={s.instructor} onPick={(id) => dispatch({ type: 'instructor', id })} />
				</WizardStep>
				<WizardStep index={3} title="Day and time" state={stateOf(3, s.step)} answer={answers[3]} onEdit={() => edit(3)}>
					<DayStrip days={days} selected={date} onPick={(date) => dispatch({ type: 'date', date })} />
					{open.error ? <p className="mt-2 text-sm text-graphite">Open days didn’t load; every day is shown.</p> : null}
					<div className="mt-6">
						{noDays ? (
							<p className="text-sm text-graphite">
								No free times in the next {siteConfig.policies.bookingWindowDays} days{teacherId ? ' with this teacher. Try first available' : '. Try another studio'}, or write to{' '}
								<a className="link-underline text-ink" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
							</p>
						) : (
							<TimeGrid times={avail.times} loading={avail.loading} error={avail.error} selected={s.timeKey} hasDate={Boolean(date)} onPick={(key) => dispatch({ type: 'time', key, date })} onRetry={avail.refresh} />
						)}
					</div>
				</WizardStep>
				<WizardStep index={4} title="Extras" state={stateOf(4, s.step)} answer={answers[4]} onEdit={() => edit(4)}>
					<AddOnsStep addOns={extras.addOns} loading={extras.loading} selected={extras.selected} currency={currency} onQuantity={extras.setQuantity} onDone={() => dispatch({ type: 'extrasDone' })} />
				</WizardStep>
				<span aria-hidden className="cable" />
			</div>
			<div className="lg:col-span-5">
				<div className="lg:sticky lg:top-28">
					<PrivateSummary
						studioName={studio?.name ?? null}
						room={studio?.room ?? null}
						format={s.format}
						teacher={teacherName}
						when={answers[3] ?? null}
						duration={series?.duration ?? 0}
						price={series?.price ?? null}
						lines={lines}
						cancelGap={series?.cancelGap ?? 0}
						currency={currency}
						ready={ready}
						pending={cart.pending}
						error={cart.error}
						onBook={book}
					/>
				</div>
			</div>
			<MobileBookBar show={ready} when={answers[3] ?? null} total={total} currency={currency} pending={cart.pending} error={cart.error} onBook={book} />
		</div>
	);
}
