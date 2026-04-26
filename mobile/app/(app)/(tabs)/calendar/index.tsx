import { getCalendarEvents } from "@/api/Calendar";
import { IconPlus } from "@/assets/icons/Icon";
import CalendarItem from "@/components/features/calendar/CalendarItem";
import { useTenant } from "@/context/TenantContext";
import { Box, FAB, Flex, Text } from "@eduinteractive/balladui";
import { useQuery } from "@tanstack/react-query";
import { RelativePathString, useFocusEffect, useRouter } from "expo-router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Agenda, CalendarProvider } from "react-native-calendars";

const CalendarScreen = () => {
	const agendaRef = useRef<Agenda>(null);
	const { currentTenant } = useTenant();
	const router = useRouter();
	const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
	const [items, setItems] = useState<Record<string, any>>({});

	const calendarEventsQuery = useQuery({
		queryKey: ["calendarEvents", currentTenant?._id],
		queryFn: () =>
			getCalendarEvents({
				tenantId: currentTenant!._id,
				params: null,
			}),
	});

	useFocusEffect(
		useCallback(() => {
			calendarEventsQuery.refetch();
			const currentDate = new Date();
			const dateObject = {
				year: currentDate.getFullYear(),
				month: currentDate.getMonth() + 1,
				day: currentDate.getDate(),
				timestamp: currentDate.getTime(),
				dateString: currentDate.toISOString(),
			};
			if (agendaRef.current) {
				agendaRef.current?.chooseDay(dateObject, false);
			}
		}, [calendarEventsQuery])
	);

	useEffect(() => {
		if (!calendarEventsQuery.data) return;

		const events = calendarEventsQuery.data;
		const itemsTemp: Record<string, any[]> = {};
		const dotsTemp: Record<string, any> = {};

		events.forEach((event) => {
			const date = new Date(event.startDate);
			const dateString = date.toISOString().split("T")[0];

			if (!itemsTemp[dateString]) itemsTemp[dateString] = [];
			itemsTemp[dateString].push({
				...event,
				name: event.title || "Unbenannter Termin",
				color: event.color || "blue",
				isPlaceholder: false,
			});

			if (!dotsTemp[dateString]) {
				dotsTemp[dateString] = { marked: true, dots: [] };
			}
			dotsTemp[dateString].dots.push({
				key: event._id,
				color: event.color || "blue",
			});
		});

		// Sort items by start date
		Object.keys(itemsTemp).forEach((key) => {
			itemsTemp[key].sort((a, b) => {
				const dateA = new Date(a.startDate).getTime();
				const dateB = new Date(b.startDate).getTime();
				return dateA - dateB;
			});
		});

		setItems(itemsTemp);
		setMarkedDates(dotsTemp);
	}, [calendarEventsQuery.data]);

	return (
		<Fragment>
			<CalendarProvider
				date={new Date().toISOString()}
				showTodayButton
			>
				<Agenda
					ref={agendaRef}
					showOnlySelectedDayItems={true}
					selected={"2025-05-05"}
					markingType="multi-dot"
					items={items}
					markedDates={markedDates}
					renderItem={(item: any) => {
						return (
							<CalendarItem
								item={item}
								onClick={(item) =>
									router.navigate(
										`calendar/${item._id}` as RelativePathString
									)
								}
							/>
						);
					}}
					renderEmptyData={() => (
						<Box
							p="md"
                            bg="white"
							mt="sm"
						>
							<Text c="gray.5">Keine Termine für diesen Tag</Text>
						</Box>
					)}
				/>
			</CalendarProvider>
			<FAB
				p="smd"
                px="md"
                color="dark"
				onPress={() => router.navigate("calendar/new" as RelativePathString)}
			>
                <Flex direction="row" align="center" gap="sm">
                    <IconPlus size={18} color="white" />
                    <Text fs="sm" fw="bold" c="white">Neuer Termin</Text>
                </Flex>
			</FAB>
		</Fragment>
	);
};

export default CalendarScreen;
