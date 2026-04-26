import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { getEvent, updateEvent } from "@/api/Events";
import EventForm from "@/components/features/event/EventForm";
import SVHLoader from "@/components/common/SVHLoader";

export default () => {
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
				title: `${eventQuery.data.event.title} bearbeiten`,
			});
		}
	}, [eventQuery.data, navigation]);

	const updateMutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Event erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["events", currentTenant!._id] });
			queryClient.invalidateQueries({ queryKey: ["event", currentTenant!.tenant!._id, eventId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: {
		title: string;
		description?: string;
		viewAccess: number;
		startDate: Date;
		endDate: Date;
	}) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!.tenant!._id,
				eventId: eventId,
				body: {
					title: data.title,
					description: data.description,
					viewAccess: data.viewAccess,
					startDate: data.startDate,
					endDate: data.endDate,
				},
			});
		} finally {
			setLoading(false);
		}
	};

	if (eventQuery.isLoading) {
		return <SVHLoader />;
	}

	if (!eventQuery.data) {
		return null;
	}

	return (
		<EventForm
			data={eventQuery.data.event}
			loading={loading}
			onSubmit={handleSubmit}
		/>
	);
};
