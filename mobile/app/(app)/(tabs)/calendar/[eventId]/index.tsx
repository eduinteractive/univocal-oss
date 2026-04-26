import React, { useLayoutEffect } from "react";
import { deleteCalendarEvent, getCalendarEvent } from "@/api/Calendar";
import { useTenant } from "@/context/TenantContext";
import { getMemberRoles } from "@/utils/Parser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Alert, ScrollView } from "react-native";
import * as Linking from "expo-linking";
import { useCallback } from "react";
import SVHLoader from "@/components/common/SVHLoader";
import SVHMaterials from "@/components/common/SVHMaterials";
import { Box, Text, Flex, Divider, applyColor } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import HeaderMenu from "@/components/layouts/HeaderMenu";
import { IconEdit, IconTrash } from "@/assets/icons/Icon";

const CalendarItemViewScreen = () => {
	const { currentTenant } = useTenant();
	const { eventId } = useLocalSearchParams();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const router = useRouter();

	const calendarEventQuery = useQuery({
		queryKey: ["calendarEvent", currentTenant?._id, eventId],
		queryFn: () =>
			getCalendarEvent({
				tenantId: currentTenant!._id,
				eventId: eventId as string,
			}),
		enabled: !!eventId && !!currentTenant,
	});

	const deleteEventMutation = useMutation({
		mutationFn: deleteCalendarEvent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Termin erfolgreich gelöscht");
			queryClient.invalidateQueries({ queryKey: ["calendarEvents", currentTenant?._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	useFocusEffect(
		useCallback(() => {
			calendarEventQuery.refetch();
		}, [calendarEventQuery])
	);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderMenu
					options={[
						{ label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
						{ label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
					]}
					onSelect={(value) => {
						if (value === "edit") router.push(`/calendar/${eventId}/edit`);
						if (value === "delete") handleDelete();
					}}
				/>
			),
		});
	}, [navigation, eventId, router]);

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diesen Termin wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteEventMutation.mutateAsync({
							tenantId: currentTenant!._id,
							eventId: eventId as string,
						});
					} catch (error) {
						Alert.alert("Fehler", "Der Termin konnte nicht gelöscht werden.");
					}
				},
			},
		]);
	};

	if (calendarEventQuery.isLoading || !calendarEventQuery.data) {
		return <SVHLoader />;
	}

	const event = calendarEventQuery.data;

	return (
		<ScrollView style={{ flex: 1, backgroundColor: "white" }}>
			<Box p="md">
				<Flex
					direction="column"
					gap="lg"
				>
					<Flex
						direction="column"
						gap="xs"
						style={{
							borderLeftColor: event.color || applyColor("blue"),
							borderLeftWidth: 5,
						}}
						pl="md"
					>
						<Text
							fs="xl"
							fw="bold"
							style={{
								paddingVertical: event?.location ? 0 : 12,
							}}
						>
							{event?.title}
						</Text>
						{event?.location && <Text c="gray.4">{event?.location}</Text>}
					</Flex>

					<Divider />

					<Flex
						direction="column"
						gap="xs"
					>
						<Text fw="bold">Datum:</Text>
						<Text>
							{dayjs(event.startDate).format("DD.MM.YYYY HH:mm")}
							{event.endDate &&
								` - ${dayjs(event.endDate).format("DD.MM.YYYY HH:mm")}`}
						</Text>
					</Flex>

					{event.description && (
						<>
							<Divider />

							<Flex
								direction="column"
								gap="xs"
							>
								<Text fw="bold">Beschreibung:</Text>
								<Text>{event?.description}</Text>
							</Flex>
						</>
					)}

					{event.viewAccess !== undefined && (
						<>
							<Divider />
							<Flex
								direction="column"
								gap="xs"
							>
								<Text fw="bold">Sichtbarkeit:</Text>
								<Text>
									{
										getMemberRoles(
											currentTenant?.type
										).find(
											(role) =>
												role.value ===
												event!.viewAccess
										)?.label
									}
								</Text>
							</Flex>
						</>
					)}

					{event.materials.length > 0 && (
						<>
							<Divider />
							<Text fw="bold">Materialien:</Text>
							<SVHMaterials
								materials={event.materials}
								onPress={(material) =>
									Linking.openURL(
										`https://apps.univocal.de/api/event/public/event/${
											event?._id
										}/download/${encodeURIComponent(
											material.link
										)}`
									)
								}
							/>
						</>
					)}
				</Flex>
			</Box>
		</ScrollView>
	);
};

export default CalendarItemViewScreen;
