import { Box, Text, Flex } from "@eduinteractive/balladui";
import { UVCEvent, UVCEventAttendee, UVCEventRegistration } from "@/api/Events";
import dayjs from "dayjs";

interface EventGeneralProps {
	data?: {
		event: UVCEvent;
		attendees: UVCEventAttendee[];
		registrations: UVCEventRegistration[];
	};
}

export default function EventGeneral({ data }: EventGeneralProps) {
	if (!data) {
		return null;
	}

	const { event } = data;

	return (
		<Flex
			direction="column"
			gap="md"
			p="sm"
		>
			<Flex
				justify="space-between"
				align="flex-start"
			>
				<Flex
					direction="column"
					gap="sm"
				>
					<Text
						fs="xl"
						fw="bold"
					>
						{event.title}
					</Text>
					{event.description && (
						<Text>{event.description}</Text>
					)}
				</Flex>
			</Flex>

			<Flex
				direction="column"
				gap="sm"
				mt="md"
			>
				<Text
					fs="md"
					fw="bold"
				>
					Datum & Zeit
				</Text>
				<Text>
					{dayjs(event.startDate).format("DD.MM.YYYY HH:mm")}
					{event.endDate && ` - ${dayjs(event.endDate).format("DD.MM.YYYY HH:mm")}`}
				</Text>
			</Flex>

			<Flex
				direction="column"
				gap="sm"
				align="flex-end"
				mt="md"
			>
				<Text
					fs="sm"
					c="gray.4"
				>
					Erstellt am: {dayjs(event.createdAt).format("DD.MM.YYYY HH:mm")}
				</Text>
				<Text
					fs="sm"
					c="gray.4"
				>
					Zuletzt aktualisiert: {dayjs(event.updatedAt).format("DD.MM.YYYY HH:mm")}
				</Text>
			</Flex>
		</Flex>
	);
} 