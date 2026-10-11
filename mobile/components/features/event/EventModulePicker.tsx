import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { Button, Card, Flex, Text, applyColor } from "@eduinteractive/balladui";

export type EventModuleId = "program" | "registration" | "checkin";

const MODULES: { id: EventModuleId; title: string; description: string }[] = [
	{
		id: "program",
		title: "Programm",
		description: "Ablauf mit Programmpunkten und Materialien für die Teilnehmenden.",
	},
	{
		id: "registration",
		title: "Anmeldung",
		description: "Teilnehmende melden sich vorab mit eigenen Feldern an.",
	},
	{
		id: "checkin",
		title: "Check-in",
		description: "Anwesenheit vor Ort über ein Formular erfassen.",
	},
];

interface EventModulePickerProps {
	disabled?: boolean;
	onActivate: (modules: EventModuleId[]) => void;
}

export default function EventModulePicker({ disabled, onActivate }: EventModulePickerProps) {
	const [selected, setSelected] = useState<EventModuleId[]>([]);

	const toggle = (id: EventModuleId) => {
		setSelected((current) =>
			current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
		);
	};

	return (
		<ScrollView style={{ flex: 1, backgroundColor: "white" }}>
			<Flex
				direction="column"
				gap="md"
				p="md"
			>
				<Text
					fs="lg"
					fw="bold"
				>
					Welche Bereiche gehören zu dieser Veranstaltung?
				</Text>
				<Text
					fs="sm"
					c="gray.6"
				>
					Mehrere Bereiche können aktiv sein. Die Auswahl kannst du später in den Einstellungen ändern.
				</Text>
				{MODULES.map((module) => {
					const active = selected.includes(module.id);
					return (
						<Pressable
							key={module.id}
							onPress={() => toggle(module.id)}
							disabled={disabled}
						>
							<Card
								variant="outline"
								bg={active ? "primary.0" : "white"}
								p="md"
								style={{
									borderColor: active ? applyColor("primary") : applyColor("gray.3"),
									borderWidth: active ? 2 : 1,
								}}
							>
								<Flex
									direction="column"
									gap="xs"
								>
									<Text
										fw="bold"
										fs="smd"
									>
										{module.title}
									</Text>
									<Text
										fs="sm"
										c="gray.6"
									>
										{module.description}
									</Text>
								</Flex>
							</Card>
						</Pressable>
					);
				})}
				<Button
					variant="filled"
					disabled={disabled || selected.length === 0}
					loading={disabled}
					onPress={() => onActivate(selected)}
				>
					Bereiche aktivieren
				</Button>
			</Flex>
		</ScrollView>
	);
}
