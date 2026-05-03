import React from "react";
import { UVCEvent, UVCEventAttendee, UVCEventRegistration } from "@/api/Events";
import EventFieldsDisplay from "./EventFieldsDisplay";
import { useMemo } from "react";
import { BASE_URL } from "@/api/APIHandler";

interface EventRegistrationsProps {
	data?: {
		event: UVCEvent;
		attendees: UVCEventAttendee[];
		registrations: UVCEventRegistration[];
	};
	onUpdate: (data: any) => void;
}

export default function EventRegistrations({ data, onUpdate }: EventRegistrationsProps) {
	const registrationLink = useMemo(() => {
		return `${BASE_URL}/event-registration/${data?.event._id}`;
	}, [data?.event._id]);

	if (!data) {
		return null;
	}

	const handleToggleRegistration = async (enabled: boolean, fields: any[]) => {
		await onUpdate({
			config: {
				registration: {
					enabled,
					fields,
				},
			},
		});
	};

	return (
		<EventFieldsDisplay
			title="Anmeldefelder"
			editRoute="editRegistration"
			fields={data.event.config.registration.fields}
			participants={data.registrations}
			participantLabel="Angemeldete Teilnehmer"
			emptyMessage="Noch keine Anmeldungen vorhanden"
			enabledInitially={data.event.config.registration.enabled || false}
			enableLabel="Anmeldung aktivieren"
			enableDescription="Aktiviere die Anmeldung, um die Teilnehmer*innen sich im Voraus für das Event anmelden lassen zu können."
			onToggleEnabled={handleToggleRegistration}
			linkUrl={registrationLink}
			linkLabel="Informationen zur Anmeldung"
			eventId={data.event._id}
		/>
	);
}
