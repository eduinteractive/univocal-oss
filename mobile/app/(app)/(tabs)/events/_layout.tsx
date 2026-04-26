import HeaderFeature from "@/components/layouts/HeaderFeature";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";

export default () => {
	const router = useRouter();

	return (
		<Stack screenOptions={{ headerBackTitle: "Zurück" }}>
			<Stack.Screen
				name="index"
				options={{
					title: "Veranstaltungen",
					header: () => <HeaderFeature title="Veranstaltungen" />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{ title: "Neue Veranstaltung" }}
			/>
			<Stack.Screen
				name="[eventId]/index"
				options={{ title: "" }}
			/>
			<Stack.Screen
				name="[eventId]/edit"
				options={{ title: "" }}
			/>
			<Stack.Screen
				name="[eventId]/editCheckIn"
				options={{ title: "" }}
			/>
			<Stack.Screen
				name="[eventId]/editRegistration"
				options={{ title: "" }}
			/>
			<Stack.Screen
				name="[eventId]/editProgram"
				options={{ title: "" }}
			/>
		</Stack>
	);
};
