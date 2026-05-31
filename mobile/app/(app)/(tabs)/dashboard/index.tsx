import { getTenantDashboard, TenantDashboardItemType } from "@/api/Tenant";
import {
	IconBucket,
	IconCalendar,
	IconClipboard,
	IconLibrary,
	IconMessages,
	IconMoneybag,
	IconSettings,
	IconTimelineEvent,
	IconUsers,
	IconUserSquareRounded,
} from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import CalendarItem from "@/components/features/calendar/CalendarItem";
import { FEATURE_COLORS } from "@/constants/Colors";
import { useTenant } from "@/context/TenantContext";
import { registerForPushNotificationsAsync, sendPushNotification } from "@/utils/PushNotifications";
import { Box, Button, Card, Flex, Text } from "@eduinteractive/balladui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Route, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import * as Notifications from "expo-notifications";
import { updateUserPushToken } from "@/api/Auth";

export const TENANT_NAVIGATION_ITEMS = [
	{
		title: "Mitglieder",
		route: "/members",
		icon: IconUsers,
		color: FEATURE_COLORS.MEMBERS,
	},
	{
		title: "Projekte",
		route: "/projects",
		icon: IconBucket,
		color: FEATURE_COLORS.PROJECTS,
	},
	{
		title: "Kalender",
		route: "/calendar",
		icon: IconCalendar,
		color: FEATURE_COLORS.CALENDAR,
	},
	{
		title: "Wissen",
		route: "/knowledge",
		icon: IconLibrary,
		color: FEATURE_COLORS.KNOWLEDGE,
	},
	{
		title: "Umfragen",
		route: "/survey",
		icon: IconClipboard,
		color: FEATURE_COLORS.SURVEYS,
	},
	{
		title: "SV-Profil",
		route: "/profile",
		icon: IconUserSquareRounded,
		color: FEATURE_COLORS.SVPROFILE,
	},
	{
		title: "Chat",
		route: "/chat",
		icon: IconMessages,
		color: FEATURE_COLORS.CHAT,
	},
	{
		title: "Veranstaltungen",
		route: "/events",
		icon: IconTimelineEvent,
		color: FEATURE_COLORS.EVENTS,
	},
	{
		title: "Finanzen",
		route: "/budgets",
		icon: IconMoneybag,
		color: FEATURE_COLORS.FINANCE,
	},
	{
		title: "Einstellungen",
		route: "/settings",
		icon: IconSettings,
		color: FEATURE_COLORS.SETTINGS,
	},
];

const StartScreen = () => {
	const router = useRouter();
	const { currentTenant } = useTenant();

	const dashboardQuery = useQuery({
		queryKey: ["dashboard", currentTenant?._id],
		queryFn: () => getTenantDashboard({ tenantId: currentTenant!._id }),
	});

	const updatePushTokenMutation = useMutation({
		mutationFn: updateUserPushToken,
	});

	useEffect(() => {
		registerForPushNotificationsAsync()
			.then((token) => {
				if (token) {
					updatePushTokenMutation.mutate({
						body: {
							pushToken: token
								.replace("ExponentPushToken[", "")
								.replace("]", ""),
						},
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	const renderNavigationItem = (item: (typeof TENANT_NAVIGATION_ITEMS)[0]) => {
		return (
			<TouchableOpacity
				key={item.title}
				onPress={() => router.push(item.route as Route)}
				style={{
					marginBottom: 10,
					marginRight: 20,
					alignItems: "center",
				}}
			>
				<Card
					variant="filled"
					p="xl"
					radius={50}
					h={20}
					w={20}
					style={{
						backgroundColor: item.color,
					}}
				>
					<Flex
						direction="column"
						gap="sm"
						align="center"
						justify="center"
					>
						<item.icon
							size={22}
							color="white"
						/>
					</Flex>
				</Card>
				<Text
					fs={10}
					fw="bold"
					mt="xs"
				>
					{item.title}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<Box>
			<ScrollView
				horizontal
				style={{
					backgroundColor: "white",
					borderBottomWidth: 0.2,
                    paddingTop: 5,
                    paddingBottom: 5,
					borderBottomColor: "#BBB",
				}}
			>
				<View style={{ display: "flex", flexWrap: "nowrap", flexDirection: "row", margin: 10 }}>
					{TENANT_NAVIGATION_ITEMS.map((item) => renderNavigationItem(item))}
				</View>
			</ScrollView>
			<UVCMetaCards
				FlatListProps={{
					ListHeaderComponent: () => (
						<>
							{dashboardQuery.data?.calendarEvents &&
								dashboardQuery.data?.calendarEvents.length > 0 && (
									<Box
										mx="sm"
										mt="sm"
									>
										<Text
											fs="md"
											fw="bold"
											c="gray.8"
										>
											Heutige Termine
										</Text>
										{dashboardQuery.data?.calendarEvents &&
											dashboardQuery.data
												?.calendarEvents
												.length > 0 &&
											dashboardQuery.data?.calendarEvents.map(
												(event) => (
													<CalendarItem
														key={
															event._id
														}
														item={
															event
														}
														onClick={() =>
															router.navigate(
																`/calendar/${event._id}`,
																{
																	withAnchor: true,
																}
															)
														}
													/>
												)
											)}
									</Box>
								)}
							<Box
								mx="sm"
								mt="sm"
							>
								<Text
									fs="md"
									fw="bold"
									c="gray.8"
								>
									Aktuelles
								</Text>
							</Box>
						</>
					),
				}}
				permissionPrefix="dashboard"
				data={dashboardQuery.data?.dashboardItems || []}
				isRefreshing={dashboardQuery.isRefetching}
				onRefresh={dashboardQuery.refetch}
				onOpen={(metaId, type) => {
					switch (type) {
						case TenantDashboardItemType.EVENT:
							router.navigate(`/events/${metaId}`, { withAnchor: true });
							break;
						case TenantDashboardItemType.WIKI:
							router.navigate(`/knowledge/wiki/${metaId}`, {
								withAnchor: true,
							});
							break;
						case TenantDashboardItemType.PROFILE_NEWS:
							router.navigate(`/profile/news/${metaId}`, {
								withAnchor: true,
							});
							break;
						case TenantDashboardItemType.PROFILE_PROJECT:
							router.navigate(`/profile/project/${metaId}`, {
								withAnchor: true,
							});
							break;
						case TenantDashboardItemType.PROJECT:
							router.navigate(`/projects/${metaId}`, { withAnchor: true });
							break;
						case TenantDashboardItemType.SURVEY:
							router.navigate(`/survey/${metaId}`, { withAnchor: true });
							break;
					}
				}}
			/>
		</Box>
	);
};

export default StartScreen;
