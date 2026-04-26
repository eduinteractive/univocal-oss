import { createCalendarEvent } from "@/api/Calendar";
import CalendarItemForm from "@/components/features/calendar/CalendarItemForm";
import { useTenant } from "@/context/TenantContext";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

const CalendarNewItemScreen = () => {
	const { currentTenant } = useTenant();
	const router = useRouter();

	const calendarEventCreateMutation = useMutation({
		mutationFn: createCalendarEvent,
		onSuccess: (data) => {
			router.navigate(`/calendar`);
		},
		onError: NotificationHandler.showAxiosError,
	});

	return (
		<CalendarItemForm
			onSubmit={(body) =>
				calendarEventCreateMutation.mutateAsync({
					tenantId: currentTenant!._id,
					body,
				})
			}
		/>
	);
};

export default CalendarNewItemScreen;
