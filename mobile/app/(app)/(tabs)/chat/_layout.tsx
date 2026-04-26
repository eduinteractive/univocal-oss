import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
	return (
		<Stack screenOptions={{ headerBackTitle: "Zurück" }} initialRouteName="index">
            <Stack.Screen
				name="index"
				options={{
					title: "Chat",
                    header: () => <HeaderFeature title="Chat" />,
				}}
			/>
            <Stack.Screen
                name="p2p/[recipientId]"
                options={{
                    title: "Chat",
                }}
            />
            <Stack.Screen
                name="p2p/new"
                options={{
                    title: "Neuer Chat",
                }}
            />
            <Stack.Screen
                name="p2g/[tenantId]"
                options={{
                    title: "Gruppenchat",
                }}
            />
		</Stack>
	);
};
