import { getCalendarEvent, updateCalendarEvent } from "@/api/Calendar";
import UVCLoader from "@/components/common/UVCLoader";
import CalendarItemForm from "@/components/features/calendar/CalendarItemForm";
import { useTenant } from "@/context/TenantContext";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

const CalendarEditItemScreen = () => {
	const { currentTenant } = useTenant();
	const { eventId } = useLocalSearchParams();
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

	const calendarEventUpdateMutation = useMutation({
		mutationFn: updateCalendarEvent,
		onSuccess: (data) => {
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	if (calendarEventQuery.isLoading || !calendarEventQuery.data) {
		return (
			<UVCLoader />
		);
	}

	const event = calendarEventQuery.data;

	return (
		<CalendarItemForm
			data={event}
			onSubmit={(body) =>
				calendarEventUpdateMutation.mutateAsync({
					tenantId: currentTenant!._id,
					eventId: event._id,
					body,
				})
			}
		/>
	);
};

export default CalendarEditItemScreen;