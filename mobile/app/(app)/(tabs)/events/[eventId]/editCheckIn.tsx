import React, { useState, useLayoutEffect } from "react";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { getEvent, updateEvent } from "@/api/Events";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCLoader from "@/components/common/UVCLoader";
import EventFieldsForm from "@/components/features/event/EventFieldsForm";

interface CustomField {
	key: string;
	value: string;
}

export default function EditCheckIn() {
	const { eventId } = useLocalSearchParams<{ eventId: string }>();
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const [loading, setLoading] = useState(false);

	const eventQuery = useQuery({
		queryKey: ["event", currentTenant?.tenant!._id, eventId],
		queryFn: () =>
			getEvent({
				eventId: eventId,
				tenantId: currentTenant!.tenant!._id,
			}),
	});

	useLayoutEffect(() => {
		if (eventQuery.data) {
			navigation.setOptions({
				title: "Check-In Felder bearbeiten",
			});
		}
	}, [eventQuery.data, navigation]);

	const updateMutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Felder erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["event", currentTenant!.tenant!._id, eventId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSave = async (fields: CustomField[]) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!.tenant!._id,
				eventId: eventId,
				body: {
					config: {
						accreditation: {
							enabled: eventQuery.data!.event.config.accreditation.enabled,
							fields: fields,
						},
					},
				},
			});
		} finally {
			setLoading(false);
		}
	};

	if (eventQuery.isLoading) {
		return <UVCLoader />;
	}

	if (!eventQuery.data) {
		return null;
	}

	return (
		<EventFieldsForm
			fields={eventQuery.data.event.config.accreditation.fields || []}
			title="Check-In Felder verwalten"
			loading={loading}
			onSave={handleSave}
		/>
	);
}
