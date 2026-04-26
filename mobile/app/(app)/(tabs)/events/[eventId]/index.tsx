import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import EventGeneral from "@/components/features/event/EventGeneral";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvent, updateEvent, deleteEvent } from "@/api/Events";
import { useTenant } from "@/context/TenantContext";
import SVHLoader from "@/components/common/SVHLoader";
import { useLayoutEffect, useMemo } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { applyColor, Button, Tabs, Flex } from "@eduinteractive/balladui";
import EventRegistrations from "@/components/features/event/EventRegistrations";
import EventProgram from "@/components/features/event/EventProgram";
import EventCheckIn from "@/components/features/event/EventCheckIn";
import { Alert } from "react-native";
import { IconEdit, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const { currentTenant } = useTenant();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const eventQuery = useQuery({
		queryKey: ["event", currentTenant?.tenant!._id, eventId],
		queryFn: () =>
			getEvent({
				eventId: eventId,
				tenantId: currentTenant!.tenant!._id,
			}),
	});

	const updateMutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Event erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["event", currentTenant?.tenant!._id, eventId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const deleteMutation = useMutation({
		mutationFn: deleteEvent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Event erfolgreich gelöscht");
			queryClient.invalidateQueries({ queryKey: ["events", currentTenant?.tenant!._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleUpdateEvent = async (data: any) => {
		await updateMutation.mutateAsync({
			tenantId: currentTenant!.tenant!._id,
			eventId: eventId,
			body: data,
		});
		queryClient.invalidateQueries({ queryKey: ["event", currentTenant?.tenant!._id, eventId] });
	};

	const handleDelete = () => {
		Alert.alert("Event löschen", "Möchtest du diese Veranstaltung wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteMutation.mutateAsync({
							tenantId: currentTenant!.tenant!._id,
							eventId: eventId,
						});
					} catch (error) {
						Alert.alert("Fehler", "Die Veranstaltung konnte nicht gelöscht werden.");
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (eventQuery.data) {
			navigation.setOptions({
				title: eventQuery.data.event.title,
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "edit") router.push(`/events/${eventId}/edit` as RelativePathString);
                            if (value === "delete") handleDelete();
                        }}
                    />
				),
			});
		}
	}, [eventQuery.data, navigation]);

	const tabs = useMemo(
		() => [
			{
				value: "general",
				label: "Allgemein",
				component: <EventGeneral data={eventQuery.data} />,
			},
			{
				value: "registrations",
				label: "Anmeldungen",
				component: (
					<EventRegistrations 
						data={eventQuery.data} 
						onUpdate={handleUpdateEvent}
					/>
				),
			},
			{
				value: "program",
				label: "Programm",
				component: (
					<EventProgram
						data={eventQuery.data}
						onUpdate={handleUpdateEvent}
						isRefetching={eventQuery.isRefetching}
						onRefresh={() => eventQuery.refetch()}
					/>
				),
			},
			{
				value: "checkin",
				label: "Check-In",
				component: (
					<EventCheckIn
						data={eventQuery.data}
						onUpdate={handleUpdateEvent}
					/>
				),
			},
		],
		[eventQuery.data]
	);

	if (eventQuery.isLoading) {
		return <SVHLoader />;
	}

	return (
		<Tabs
			bg="white"
            pt="sm"
			tabs={tabs}
			initialValue={"general"}
		/>
	);
};
