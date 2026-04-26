import { RelativePathString, useRouter, useNavigation } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createEvent } from "@/api/Events";
import EventForm from "@/components/features/event/EventForm";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const [loading, setLoading] = useState(false);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Neues Event",
		});
	}, [navigation]);

	const createMutation = useMutation({
		mutationFn: createEvent,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Event erfolgreich erstellt");
			queryClient.invalidateQueries({ queryKey: ["events", currentTenant!._id] });
			router.replace(`/events/${data._id}` as RelativePathString);
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
			await createMutation.mutateAsync({
				tenantId: currentTenant!._id,
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

	return (
		<EventForm
			data={null}
			loading={loading}
			onSubmit={handleSubmit}
		/>
	);
};
