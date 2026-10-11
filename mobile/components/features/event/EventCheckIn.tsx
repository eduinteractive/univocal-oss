import { UVCEvent, UVCEventAttendee, UVCEventRegistration, publicEventUrl } from "@/api/Events";
import EventFieldsDisplay from "./EventFieldsDisplay";

interface EventCheckInProps {
	data?: {
		event: UVCEvent;
		attendees: UVCEventAttendee[];
		registrations: UVCEventRegistration[];
	};
	onUpdate: (data: unknown) => void;
	onDeleteAttendee?: (attendeeId: string) => void;
}

export default function EventCheckIn({ data, onDeleteAttendee }: EventCheckInProps) {
	if (!data) {
		return null;
	}

	return (
		<EventFieldsDisplay
			title="Check-In Felder"
			editRoute="editCheckIn"
			fields={data.event.config.accreditation.fields}
			participants={data.attendees}
			participantLabel="Eingecheckte Teilnehmer"
			emptyMessage="Noch keine Check-Ins vorhanden"
			onDeleteParticipant={onDeleteAttendee}
			linkUrl={publicEventUrl(data.event._id)}
			linkLabel="Öffentliche Seite"
			eventId={data.event._id}
		/>
	);
}
