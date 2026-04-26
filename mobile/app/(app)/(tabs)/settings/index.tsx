import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { getTenant, updateTenant } from "@/api/Tenant";
import { createNotification } from "@/api/Notifications";
import { CalendarTokenStatus, activateCalendar, deactivateCalendar, getCalendarToken } from "@/api/Calendar";
import TenantIntegrations from "@/components/features/tenant/TenantIntegrations";
import TenantFunctions from "@/components/features/tenant/TenantFunctions";
import TenantMisc from "@/components/features/tenant/TenantMisc";
import TenantNotificationModal from "@/components/features/tenant/TenantNotificationModal";
import { Flex, Text, Tabs, TabItem } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import SVHLoader from "@/components/common/SVHLoader";

export default () => {
	const { currentTenant, userTenants } = useTenant();
	const [notificationModalVisible, setNotificationModalVisible] = useState(false);

	const tenantQuery = useQuery({
		queryKey: ["tenant", currentTenant?._id],
		queryFn: () => getTenant({ id: currentTenant?._id }),
		enabled: !!currentTenant?._id,
	});

	const calendarTokenQuery = useQuery({
		queryKey: ["calendarToken", currentTenant?._id],
		queryFn: () => getCalendarToken(currentTenant!._id),
		enabled: !!currentTenant?._id,
	});

	const tenantUpdateMutation = useMutation({
		mutationFn: updateTenant,
		onSuccess: () => {
			NotificationHandler.showSuccess("Einstellungen erfolgreich gespeichert!");
			tenantQuery.refetch();
		},
		onError: (error) => {
			NotificationHandler.showError("Fehler beim Speichern der Einstellungen");
		},
	});

	const createTenantNotificationMutation = useMutation({
		mutationFn: createNotification,
		onSuccess: () => {
			NotificationHandler.showSuccess("Benachrichtigung erfolgreich versendet!");
		},
		onError: (error) => {
			NotificationHandler.showError("Fehler beim Versenden der Benachrichtigung");
		},
	});

	const activateCalendarMutation = useMutation({
		mutationFn: activateCalendar,
		onSuccess: () => {
			calendarTokenQuery.refetch();
			NotificationHandler.showSuccess("Gruppenkalender freigegeben!");
		},
		onError: (error) => {
			NotificationHandler.showError("Fehler beim Freigeben des Kalenders");
		},
	});

	const deactivateCalendarMutation = useMutation({
		mutationFn: deactivateCalendar,
		onSuccess: () => {
			calendarTokenQuery.refetch();
			NotificationHandler.showSuccess("Gruppenkalender nicht freigegeben!");
		},
		onError: (error) => {
			NotificationHandler.showError("Fehler beim Deaktivieren des Kalenders");
		},
	});

	if (!currentTenant) {
		return (
			<Flex
				direction="column"
				justify="center"
				align="center"
				style={{ flex: 1, padding: 16 }}
			>
				<Text
					fs="lg"
					c="gray.6"
				>
					Keine Gruppe ausgewählt
				</Text>
			</Flex>
		);
	}

	if (!tenantQuery.data) {
		return <SVHLoader />;
	}

	const tabs: TabItem[] = [
		{
			value: "integrations",
			label: "Integrationen",
			component: (
				<ScrollView style={{ flex: 1, padding: 16 }}>
					<TenantIntegrations
						tenant={tenantQuery.data?.tenant}
						onUpdate={({ integrations }) => {
							tenantUpdateMutation.mutate({
								id: currentTenant?._id,
								body: {
									integrations: integrations,
								},
							});
						}}
					/>
				</ScrollView>
			),
		},
		{
			value: "functions",
			label: "Funktionen",
			component: (
				<ScrollView style={{ flex: 1, padding: 16 }}>
					<TenantFunctions onNotification={() => setNotificationModalVisible(true)} />
				</ScrollView>
			),
		},
		{
			value: "misc",
			label: "Sonstiges",
			component: (
				<ScrollView style={{ flex: 1, padding: 16 }}>
					<TenantMisc
						settings={{
							calendarTokenStatus:
								calendarTokenQuery.data?.status ===
								CalendarTokenStatus.ACTIVE,
						}}
						onCalendarExport={() =>
							calendarTokenQuery.data?.status === CalendarTokenStatus.ACTIVE
								? deactivateCalendarMutation.mutate(currentTenant!._id)
								: activateCalendarMutation.mutate(currentTenant!._id)
						}
					/>
				</ScrollView>
			),
		},
	];

	return (
		<Flex
			direction="column"
			style={{ flex: 1, backgroundColor: "#f8f9fa" }}
		>
			<Tabs
				tabs={tabs}
				initialValue="integrations"
			/>

			<TenantNotificationModal
				visible={notificationModalVisible}
				onClose={() => setNotificationModalVisible(false)}
				onSubmit={(content) => {
					createTenantNotificationMutation.mutate({
						tenantId: currentTenant!._id,
						body: { content },
					});
					setNotificationModalVisible(false);
				}}
			/>
		</Flex>
	);
};
