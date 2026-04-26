import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
	return (
		<Stack screenOptions={{ headerBackTitle: "Zurück" }}>
            <Stack.Screen
				name="index"
				options={{
					title: "Kalender",
                    header: () => <HeaderFeature title="Kalender" />,
				}}
			/>
			<Stack.Screen
				name="new"
				options={{
					title: "Neuer Termin",
				}}
			/>
			<Stack.Screen
				name="[eventId]/index"
				options={{
					title: "Termindetails",
				}}
			/>
            <Stack.Screen
                name="[eventId]/edit"
                options={{
                    title: "Termin bearbeiten",
                    headerBackTitle: "Zurück",
                }}
            />
		</Stack>
	);
};
