import React from "react";
import { Flex, Text, Button, Box, TextInput, DateInput, TimeInput, applyColor, applySizeProp } from "@eduinteractive/balladui";
import { UVCEvent, UVCEventAttendee, UVCEventRegistration, UVCEventSession, publicEventUrl } from "@/api/Events";
import { useState } from "react";
import { ScrollView, RefreshControl, Share, Alert } from "react-native";
import Markdown from "react-native-markdown-display";
import { htmlToMarkdown } from "@/utils/Parser";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { IconEdit, IconTrash } from "@/assets/icons/Icon";
import dayjs from "dayjs";

interface EventProgramProps {
	data?: {
		event: UVCEvent;
		attendees: UVCEventAttendee[];
		registrations: UVCEventRegistration[];
	};
	onUpdate: (data: any) => void;
	isRefetching?: boolean;
	onRefresh?: () => void;
}

const formatTime = (date: Date) =>
	`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

const newSessionId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function EventProgram({ data, onUpdate, isRefetching, onRefresh }: EventProgramProps) {
	const router = useRouter();
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const [draftId, setDraftId] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [place, setPlace] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [hasEnd, setHasEnd] = useState(false);

	const programLink = publicEventUrl(eventId);

	if (!data) {
		return null;
	}

	const sessions = data.event.config.toc.sessions ?? [];

	const persistSessions = (next: UVCEventSession[]) => {
		onUpdate({
			config: {
				toc: {
					sessions: next,
				},
			},
		});
	};

	const openDraft = (session?: UVCEventSession) => {
		const start = session?.start ? new Date(session.start) : new Date();
		const end = session?.end ? new Date(session.end) : null;
		setDraftId(session?.id ?? newSessionId());
		setTitle(session?.title ?? "");
		setPlace(session?.place ?? "");
		setDescription(session?.description ?? "");
		setStartDate(start);
		setEndDate(end);
		setHasEnd(Boolean(end));
	};

	const saveSession = () => {
		if (!draftId || !title.trim()) {
			NotificationHandler.showError("Titel und Beginn sind erforderlich.");
			return;
		}
		if (hasEnd && endDate && endDate < startDate) {
			NotificationHandler.showError("Das Ende muss nach dem Beginn liegen.");
			return;
		}
		const session: UVCEventSession = {
			id: draftId,
			title: title.trim(),
			start: startDate,
			...(hasEnd && endDate ? { end: endDate } : {}),
			place: place.trim(),
			description: description.trim(),
		};
		const exists = sessions.some((item) => item.id === session.id);
		persistSessions(
			exists ? sessions.map((item) => (item.id === session.id ? session : item)) : [...sessions, session]
		);
		setDraftId(null);
	};

	const moveSession = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= sessions.length) return;
		const next = [...sessions];
		const [item] = next.splice(index, 1);
		next.splice(target, 0, item);
		persistSessions(next);
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
				<Flex
					direction="column"
					gap="sm"
				>
					<Text
						fs="md"
						fw="bold"
					>
						Ablauf
					</Text>
					<Text
						fs="sm"
						c="gray.6"
					>
						Programmpunkte der öffentlichen Seite.
					</Text>
					{sessions.length === 0 && <Text c="gray.4">Noch keine Programmpunkte.</Text>}
					{sessions.map((session, index) => (
						<Box
							key={session.id}
							p="sm"
							style={{
								backgroundColor: "#f9f9f9",
								borderRadius: 8,
								borderWidth: 1,
								borderColor: "#e0e0e0",
							}}
						>
							<Text
								fs="xs"
								c="gray.5"
							>
								{dayjs(session.start).format("DD.MM.YYYY HH:mm")}
								{session.end ? ` – ${dayjs(session.end).format("HH:mm")}` : ""}
								{session.place ? ` · ${session.place}` : ""}
							</Text>
							<Text fw="bold">{session.title}</Text>
							{!!session.description && <Text fs="sm">{session.description}</Text>}
							<Flex
								direction="row"
								gap="xs"
								wrap="wrap"
								mt="xs"
							>
								<Button
									variant="subtle"
									size="sm"
									disabled={index === 0}
									onPress={() => moveSession(index, -1)}
								>
									Hoch
								</Button>
								<Button
									variant="subtle"
									size="sm"
									disabled={index === sessions.length - 1}
									onPress={() => moveSession(index, 1)}
								>
									Runter
								</Button>
								<Button
									variant="subtle"
									size="sm"
									onPress={() => openDraft(session)}
								>
									<IconEdit size={16} />
								</Button>
								<Button
									variant="subtle"
									size="sm"
									onPress={() =>
										Alert.alert("Programmpunkt entfernen", "Möchtest du diesen Programmpunkt entfernen?", [
											{ text: "Abbrechen", style: "cancel" },
											{
												text: "Entfernen",
												style: "destructive",
												onPress: () =>
													persistSessions(sessions.filter((item) => item.id !== session.id)),
											},
										])
									}
								>
									<IconTrash size={16} />
								</Button>
							</Flex>
						</Box>
					))}
					{draftId ? (
						<Flex
							direction="column"
							gap="sm"
						>
							<TextInput
								size="sm"
								label="Titel"
								placeholder="Titel eingeben..."
								value={title}
								onChangeText={setTitle}
							/>
							<Flex
								direction="row"
								gap="sm"
							>
								<DateInput
									size="sm"
									label="Beginn"
									value={startDate}
									onChange={(value) => {
										const next = new Date(value);
										next.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
										setStartDate(next);
									}}
								/>
								<TimeInput
									size="sm"
									label="Uhrzeit"
									value={formatTime(startDate)}
									onChange={(time) => {
										const [hours, minutes] = time.split(":").map(Number);
										const next = new Date(startDate);
										next.setHours(hours, minutes, 0, 0);
										setStartDate(next);
									}}
								/>
							</Flex>
							<Flex
								direction="row"
								gap="sm"
							>
								<DateInput
									size="sm"
									label="Ende"
									value={endDate ?? startDate}
									onChange={(value) => {
										const next = new Date(value);
										const base = endDate ?? startDate;
										next.setHours(base.getHours(), base.getMinutes(), 0, 0);
										setEndDate(next);
										setHasEnd(true);
									}}
								/>
								<TimeInput
									size="sm"
									label="Uhrzeit"
									value={formatTime(endDate ?? startDate)}
									onChange={(time) => {
										const [hours, minutes] = time.split(":").map(Number);
										const next = new Date(endDate ?? startDate);
										next.setHours(hours, minutes, 0, 0);
										setEndDate(next);
										setHasEnd(true);
									}}
								/>
							</Flex>
							<TextInput
								size="sm"
								label="Ort"
								placeholder="Ort eingeben..."
								value={place}
								onChangeText={setPlace}
							/>
							<TextInput
								size="sm"
								label="Beschreibung"
								placeholder="Beschreibung"
								value={description}
								onChangeText={setDescription}
								multiline
							/>
							<Flex
								direction="row"
								gap="sm"
							>
								<Button
									variant="filled"
									onPress={saveSession}
								>
									Speichern
								</Button>
								<Button
									variant="default"
									onPress={() => setDraftId(null)}
								>
									Abbrechen
								</Button>
							</Flex>
						</Flex>
					) : (
						<Button
							variant="outline"
							onPress={() => openDraft()}
						>
							Programmpunkt hinzufügen
						</Button>
					)}
				</Flex>

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
										Öffentliche Seite:
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
			</Flex>
		</ScrollView>
	);
}
