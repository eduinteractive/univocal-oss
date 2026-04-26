import React from "react";
import { Flex, Text, Button, Box, applyColor, applySizeProp } from "@eduinteractive/balladui";
import { SVHEvent, SVHEventAttendee, SVHEventRegistration } from "@/api/Events";
import { useState, useMemo } from "react";
import { Switch, ScrollView, RefreshControl, Share } from "react-native";
import Markdown from "react-native-markdown-display";
import { htmlToMarkdown } from "@/utils/Parser";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { BASE_URL } from "@/api/APIHandler";
import { IconEdit } from "@/assets/icons/Icon";

interface EventProgramProps {
	data?: {
		event: SVHEvent;
		attendees: SVHEventAttendee[];
		registrations: SVHEventRegistration[];
	};
	onUpdate: (data: any) => void;
	isRefetching?: boolean;
	onRefresh?: () => void;
}

export default function EventProgram({ data, onUpdate, isRefetching, onRefresh }: EventProgramProps) {
	const [programEnabled, setProgramEnabled] = useState(data?.event.config.toc.enabled || false);
	const router = useRouter();
	const { eventId } = useLocalSearchParams<{ eventId: string }>();

	const programLink = useMemo(() => {
		return `${BASE_URL}/event-program/${eventId}`;
	}, [eventId]);

	if (!data) {
		return null;
	}

	const handleToggleProgram = async () => {
		const newValue = !programEnabled;
		setProgramEnabled(newValue);

		await onUpdate({
			config: {
				toc: {
					enabled: newValue,
					content: data.event.config.toc.content,
					materials: data.event.config.toc.materials,
				},
			},
		});
	};

	const handleShare = async () => {
		try {
			await Share.share({
				message: programLink,
			});
		} catch (error) {
			NotificationHandler.showError("Fehler beim Teilen des Links");
		}
	};

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: "white" }}
			refreshControl={
				<RefreshControl
					refreshing={isRefetching || false}
					onRefresh={onRefresh}
				/>
			}
		>
			<Flex
				direction="column"
				gap="md"
				p="sm"
			>
				{/* Enable/Disable Toggle */}
				<Flex
					direction="row"
					align="center"
					gap="md"
				>
					<Switch
						value={programEnabled}
						onValueChange={handleToggleProgram}
					/>
					<Flex
						flex={1}
						direction="column"
					>
						<Text
							fs="smd"
							fw="bold"
						>
							Programm aktivieren
						</Text>
						<Text fs="sm">
							Aktiviere das Programm, um die Teilnehmer*innen ein Programm für das
							Event anzeigen zu lassen.
						</Text>
					</Flex>
				</Flex>

				{programEnabled && (
					<>
						{/* Link Information Section */}
						<Box
							bg={applyColor("gray.1")}
							p="sm"
							style={{ borderRadius: applySizeProp("sm") }}
						>
							<Flex
								gap="md"
								direction="column"
							>
								<Flex
									direction="column"
									gap="xs"
								>
									<Text
										fs="sm"
										c="gray.5"
									>
										Informationen zum Programm:
									</Text>
									<Text
										fs="xs"
										c="gray.5"
									>
										Event-ID: {eventId}
									</Text>
									<Text
										fs="xs"
										c="gray.5"
									>
										Link: {programLink}
									</Text>
								</Flex>

								<Flex
									direction="row"
									gap="sm"
									wrap="wrap"
								>
									<Button
										variant="default"
										size="md"
										onPress={handleShare}
									>
										Link teilen
									</Button>
								</Flex>
							</Flex>
						</Box>

						{/* Program Content Section */}
						<Flex
							direction="column"
							gap="sm"
							mt="md"
						>
							<Flex
								direction="row"
								justify="space-between"
								align="center"
							>
								<Text
									fs="md"
									fw="bold"
								>
									Programm
								</Text>
								<Button
									variant="subtle"
									size="sm"
									onPress={() =>
										router.push(`/events/${eventId}/editProgram`)
									}
								>
									<IconEdit
										size={16}
									/>
								</Button>
							</Flex>

							{data.event.config.toc.content ? (
								<Box
									p="sm"
									style={{
										backgroundColor: "#f9f9f9",
										borderRadius: 8,
										borderWidth: 1,
										borderColor: "#e0e0e0",
									}}
								>
									<Markdown>
										{htmlToMarkdown(data.event.config.toc.content)}
									</Markdown>
								</Box>
							) : (
								<Text c="gray.4">
									Kein Programm vorhanden.
								</Text>
							)}
						</Flex>

						{/* Materials Section */}
						<Flex
							direction="column"
							gap="sm"
							mt="md"
						>
							<Text
								fs="md"
								fw="bold"
							>
								Materialien ({data.event.config.toc.materials?.length || 0})
							</Text>

							{data.event.config.toc.materials &&
							data.event.config.toc.materials.length > 0 ? (
								<Flex
									direction="column"
									gap="xs"
								>
									{data.event.config.toc.materials.map((material, index) => (
										<Box
											key={index}
											p="sm"
											style={{
												backgroundColor: "#f5f5f5",
												borderRadius: 8,
												borderWidth: 1,
												borderColor: "#e0e0e0",
											}}
										>
											<Text fw="bold">{material.title}</Text>
											<Text
												fs="sm"
												c="gray.6"
											>
												{material.mimetype}
											</Text>
										</Box>
									))}
								</Flex>
							) : (
								<Text c="gray.4">
									Keine Materialien vorhanden.
								</Text>
							)}
						</Flex>
					</>
				)}
			</Flex>
		</ScrollView>
	);
}
