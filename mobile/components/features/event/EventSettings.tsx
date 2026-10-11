import { UVCEvent, publicEventUrl } from "@/api/Events";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Box, Button, Card, Flex, Text, applyColor, applySizeProp } from "@eduinteractive/balladui";
import { useState } from "react";
import { ScrollView, Share, Switch } from "react-native";

type EventModuleId = "program" | "registration" | "checkin";

const MODULES: { id: EventModuleId; title: string; description: string }[] = [
	{
		id: "program",
		title: "Programm",
		description: "Ablauf mit Programmpunkten und Materialien.",
	},
	{
		id: "registration",
		title: "Anmeldung",
		description: "Vorabanmeldung mit eigenen Feldern.",
	},
	{
		id: "checkin",
		title: "Check-in",
		description: "Anwesenheit vor Ort erfassen.",
	},
];

interface EventSettingsProps {
	event: UVCEvent;
	onUpdate: (data: {
		config: {
			toc?: { enabled: boolean };
			registration?: { enabled: boolean };
			accreditation?: { enabled: boolean };
			public?: { published: boolean };
		};
	}) => Promise<void> | void;
}

export default function EventSettings({ event, onUpdate }: EventSettingsProps) {
	const published = event.config.public?.published !== false;
	const [sharing, setSharing] = useState(false);
	const link = publicEventUrl(event._id);

	const enabled: Record<EventModuleId, boolean> = {
		program: event.config.toc.enabled,
		registration: event.config.registration.enabled,
		checkin: event.config.accreditation.enabled,
	};

	const toggleModule = (id: EventModuleId) => {
		const next = !enabled[id];
		if (id === "program") onUpdate({ config: { toc: { enabled: next } } });
		if (id === "registration") onUpdate({ config: { registration: { enabled: next } } });
		if (id === "checkin") onUpdate({ config: { accreditation: { enabled: next } } });
	};

	const handleShare = async () => {
		setSharing(true);
		try {
			await Share.share({ message: link });
		} catch {
			NotificationHandler.showError("Fehler beim Teilen des Links");
		} finally {
			setSharing(false);
		}
	};

	return (
		<ScrollView style={{ flex: 1, backgroundColor: "white" }}>
			<Flex
				direction="column"
				gap="lg"
				p="md"
			>
				<Flex
					direction="column"
					gap="sm"
				>
					<Text
						fs="md"
						fw="bold"
					>
						Module
					</Text>
					<Text
						fs="sm"
						c="gray.6"
					>
						Bereiche ein- oder ausschalten. Ausgeschaltete Bereiche verschwinden aus den Reitern.
					</Text>
					{MODULES.map((module) => (
						<Card
							key={module.id}
							variant="outline"
							bg="white"
							p="sm"
						>
							<Flex
								direction="row"
								align="center"
								gap="md"
							>
								<Switch
									value={enabled[module.id]}
									onValueChange={() => toggleModule(module.id)}
								/>
								<Flex
									flex={1}
									direction="column"
								>
									<Text
										fs="smd"
										fw="bold"
									>
										{module.title}
									</Text>
									<Text fs="sm">{module.description}</Text>
								</Flex>
							</Flex>
						</Card>
					))}
				</Flex>

				<Card
					variant="outline"
					bg="white"
					p="sm"
				>
					<Flex
						direction="row"
						align="center"
						gap="md"
					>
						<Switch
							value={published}
							onValueChange={(value) =>
								onUpdate({ config: { public: { published: value } } })
							}
						/>
						<Flex
							flex={1}
							direction="column"
						>
							<Text
								fs="smd"
								fw="bold"
							>
								Öffentliche Seite
							</Text>
							<Text fs="sm">
								{published
									? "Die Veranstaltung ist über den öffentlichen Link erreichbar."
									: "Die Veranstaltung ist nicht veröffentlicht."}
							</Text>
						</Flex>
					</Flex>
				</Card>

				<Box
					bg={applyColor("gray.1")}
					p="sm"
					style={{ borderRadius: applySizeProp("sm") }}
				>
					<Flex
						direction="column"
						gap="sm"
					>
						<Text
							fs="sm"
							c="gray.5"
						>
							Öffentlicher Link
						</Text>
						<Text
							fs="xs"
							c="gray.5"
						>
							{link}
						</Text>
						<Button
							variant="default"
							size="md"
							loading={sharing}
							onPress={handleShare}
						>
							Link teilen
						</Button>
					</Flex>
				</Box>
			</Flex>
		</ScrollView>
	);
}
