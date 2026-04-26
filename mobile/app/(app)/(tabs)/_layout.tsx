import { Tabs, useRouter } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { Button, Flex, Text } from "@eduinteractive/balladui";
import { IconBucket, IconCalendar, IconHome, IconMessage } from "@/assets/icons/Icon";

const TabsLayout = () => {
	const { currentTenant } = useTenant();
	const router = useRouter();

	if (!currentTenant) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
				direction="column"
				gap="md"
			>
				<Text
					align="center"
					w="85%"
				>
					Du bist in keiner Gruppe. Bitte trete erst einer Gruppe bei.
				</Text>
				<Button onPress={() => router.navigate("/(app)/invitations")}>
					Zu den Gruppeneinladungen
				</Button>
			</Flex>
		);
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "blue",
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					href: null,
					title: "Zur App",
				}}
			/>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Start",
					tabBarIcon: ({ color }) => (
						<IconHome color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="chat"
				options={{
					title: "Chat",
					tabBarIcon: ({ color }) => (
						<IconMessage color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Kalender",
					tabBarIcon: ({ color }) => (
						<IconCalendar color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="projects"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="knowledge"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="survey"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="budgets"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="events"
				options={{
					title: "Veranstaltungen",
					href: null,
				}}
			/>
			<Tabs.Screen
				name="members"
				options={{
					title: "Mitglieder",
					href: null,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "SV-Profil",
					href: null,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Einstellungen",
					href: null,
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
