import { useState } from "react";
import { UVCEvent, UVCEventAttendee, UVCEventRegistration, publicEventUrl } from "@/api/Events";
import EventFieldsDisplay from "./EventFieldsDisplay";
import { Button, Flex, Text, TextInput } from "@eduinteractive/balladui";

interface EventRegistrationsProps {
	data?: {
		event: UVCEvent;
		attendees: UVCEventAttendee[];
		registrations: UVCEventRegistration[];
	};
	onUpdate: (data: {
		config: {
			registration: {
				capacity: number | null;
			};
		};
	}) => void;
	onDeleteRegistration?: (registrationId: string) => void;
}

export default function EventRegistrations({ data, onUpdate, onDeleteRegistration }: EventRegistrationsProps) {
	const savedCapacity = data?.event.config.registration.capacity;
	const [capacity, setCapacity] = useState(
		typeof savedCapacity === "number" ? String(savedCapacity) : ""
	);

	if (!data) {
		return null;
	}

	const capacityDirty = capacity !== (typeof savedCapacity === "number" ? String(savedCapacity) : "");
	const taken = data.registrations.length;
	const limit = typeof savedCapacity === "number" ? savedCapacity : null;

	const saveCapacity = () => {
		const trimmed = capacity.trim();
		const next = trimmed === "" ? null : Number(trimmed);
		if (next !== null && (!Number.isFinite(next) || next < 0)) {
			return;
		}
		onUpdate({
			config: {
				registration: {
					capacity: next,
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
			onDeleteParticipant={onDeleteRegistration}
			linkUrl={publicEventUrl(data.event._id)}
			linkLabel="Öffentliche Seite"
			eventId={data.event._id}
			additionalContent={
				<Flex
					direction="column"
					gap="sm"
				>
					<Text
						fs="md"
						fw="bold"
					>
						Kapazität
					</Text>
					<Text
						fs="sm"
						c="gray.6"
					>
						Leer lassen für unbegrenzte Anmeldungen.
						{limit !== null ? ` ${taken} von ${limit} Plätzen belegt.` : ` ${taken} Anmeldungen.`}
					</Text>
					<TextInput
						size="sm"
						label="Plätze"
						keyboardType="number-pad"
						value={capacity}
						onChangeText={setCapacity}
						placeholder="Unbegrenzt"
					/>
					<Button
						variant="filled"
						disabled={!capacityDirty}
						onPress={saveCapacity}
					>
						Kapazität speichern
					</Button>
				</Flex>
			}
		/>
	);
}
