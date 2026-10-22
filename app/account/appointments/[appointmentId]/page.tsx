import { AppointmentDetailView, type DetailAction } from '@/components/account/appointment-detail/appointment-detail-view';

export const dynamic = 'force-dynamic';

type Params = Promise<{ appointmentId: string }>;
type Search = Promise<{ action?: string | string[] }>;

const ACTIONS: readonly DetailAction[] = ['cancel', 'reschedule', 'feedback'];

/** One booking as its check-in pass. Magic links land here with `?action=cancel|reschedule|feedback`. */
export default async function AppointmentPage({ params, searchParams }: { params: Params; searchParams: Search }) {
	const [{ appointmentId }, query] = await Promise.all([params, searchParams]);
	const raw = Array.isArray(query.action) ? query.action[0] : query.action;
	const action = ACTIONS.find((a) => a === raw) ?? null;
	return <AppointmentDetailView id={appointmentId} initialAction={action} />;
}
