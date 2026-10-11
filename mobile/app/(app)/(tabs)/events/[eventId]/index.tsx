import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import EventGeneral from "@/components/features/event/EventGeneral";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvent, updateEvent, deleteEvent, deleteEventRegistration, deleteEventAttendee } from "@/api/Events";
import { useTenant } from "@/context/TenantContext";
import UVCLoader from "@/components/common/UVCLoader";
import { useLayoutEffect, useMemo } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Tabs } from "@eduinteractive/balladui";
import EventRegistrations from "@/components/features/event/EventRegistrations";
import EventProgram from "@/components/features/event/EventProgram";
import EventCheckIn from "@/components/features/event/EventCheckIn";
import { Alert } from "react-native";
import { IconEdit, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";
import EventModulePicker, { EventModuleId } from "@/components/features/event/EventModulePicker";
import EventSettings from "@/components/features/event/EventSettings";

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

	const deleteRegistrationMutation = useMutation({
		mutationFn: deleteEventRegistration,
		onSuccess: () => {
			NotificationHandler.showSuccess("Anmeldung entfernt");
			queryClient.invalidateQueries({ queryKey: ["event", currentTenant?.tenant!._id, eventId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const deleteAttendeeMutation = useMutation({
		mutationFn: deleteEventAttendee,
		onSuccess: () => {
			NotificationHandler.showSuccess("Check-In entfernt");
			queryClient.invalidateQueries({ queryKey: ["event", currentTenant?.tenant!._id, eventId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

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

	const event = eventQuery.data?.event;
	const hasModule = Boolean(
		event?.config.toc.enabled ||
			event?.config.registration.enabled ||
			event?.config.accreditation.enabled
	);

	const activateModules = async (modules: EventModuleId[]) => {
		await handleUpdateEvent({
			config: {
				...(modules.includes("program") ? { toc: { enabled: true } } : {}),
				...(modules.includes("registration") ? { registration: { enabled: true } } : {}),
				...(modules.includes("checkin") ? { accreditation: { enabled: true } } : {}),
			},
		});
	};

	const tabs = useMemo(() => {
		if (!eventQuery.data || !event) return [];
		const next = [
			{
				value: "general",
				label: "Allgemein",
				component: <EventGeneral data={eventQuery.data} />,
			},
		];
		if (event.config.toc.enabled) {
			next.push({
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
			});
		}
		if (event.config.registration.enabled) {
			next.push({
				value: "registrations",
				label: "Anmeldungen",
				component: (
					<EventRegistrations
						data={eventQuery.data}
						onUpdate={handleUpdateEvent}
						onDeleteRegistration={(registrationId) =>
							deleteRegistrationMutation.mutate({
								tenantId: currentTenant!.tenant!._id,
								eventId,
								registrationId,
							})
						}
					/>
				),
			});
		}
		if (event.config.accreditation.enabled) {
			next.push({
				value: "checkin",
				label: "Check-In",
				component: (
					<EventCheckIn
						data={eventQuery.data}
						onUpdate={handleUpdateEvent}
						onDeleteAttendee={(attendeeId) =>
							deleteAttendeeMutation.mutate({
								tenantId: currentTenant!.tenant!._id,
								eventId,
								attendeeId,
							})
						}
					/>
				),
			});
		}
		next.push({
			value: "settings",
			label: "Einstellungen",
			component: (
				<EventSettings
					event={event}
					onUpdate={handleUpdateEvent}
				/>
			),
		});
		return next;
	}, [eventQuery.data, event, eventQuery.isRefetching]);

	if (eventQuery.isLoading) {
		return <UVCLoader />;
	}

	if (!hasModule && event) {
		return (
			<EventModulePicker
				disabled={updateMutation.isPending}
				onActivate={activateModules}
			/>
		);
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
