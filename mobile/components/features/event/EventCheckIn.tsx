import React from "react";
import { SVHEvent, SVHEventAttendee, SVHEventRegistration } from "@/api/Events";
import EventFieldsDisplay from "./EventFieldsDisplay";
import { useMemo } from "react";
import { BASE_URL } from "@/api/APIHandler";

interface EventCheckInProps {
	data?: {
		event: SVHEvent;
		attendees: SVHEventAttendee[];
		registrations: SVHEventRegistration[];
	};
	onUpdate: (data: any) => void;
}

export default function EventCheckIn({ data, onUpdate }: EventCheckInProps) {
	const checkInLink = useMemo(() => {
		return `${BASE_URL}/event-checkin/${data?.event._id}`;
	}, [data?.event._id]);

	if (!data) {
		return null;
	}

	const handleToggleCheckIn = async (enabled: boolean, fields: any[]) => {
		await onUpdate({
			config: {
				accreditation: {
					enabled,
					fields,
				},
			},
		});
	};

	return (
		<EventFieldsDisplay
			title="Check-In Felder"
			editRoute="editCheckIn"
			fields={data.event.config.accreditation.fields}
			participants={data.attendees}
			participantLabel="Eingecheckte Teilnehmer"
			emptyMessage="Noch keine Check-Ins vorhanden"
			enabledInitially={data.event.config.accreditation.enabled || false}
			enableLabel="Check-In aktivieren"
			enableDescription="Aktiviere den Check-In, um die Teilnehmer*innen beim Eintreten ins Event zu registrieren."
			onToggleEnabled={handleToggleCheckIn}
			linkUrl={checkInLink}
			linkLabel="Informationen zum Check-In"
			eventId={data.event._id}
		/>
	);
}
