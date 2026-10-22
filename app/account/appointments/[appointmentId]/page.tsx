import { StubPage } from '@/components/layout/stub-page';

export const dynamic = 'force-dynamic';

type Params = Promise<{ appointmentId: string }>;

// TODO(P5 account): booking detail. Magic links land here (`?action=cancel|reschedule|feedback`).
export default async function AppointmentPage({ params }: { params: Params }) {
	const { appointmentId } = await params;
	return <StubPage eyebrow={`Booking ${appointmentId.slice(0, 8)}`} title="Your booking" owner="P5 account + confirmation" />;
}
