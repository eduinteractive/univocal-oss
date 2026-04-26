import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
    return (
        <Stack screenOptions={{ headerBackTitle: "Zurück" }}>
            <Stack.Screen
                name="index"
                options={{
                    title: "Mitglieder",
                    header: () => <HeaderFeature title="Mitglieder" />,
                }}
            />
            <Stack.Screen
                name="new"
                options={{
                    title: "Mitglied einladen",
                }}
            />
            <Stack.Screen
                name="[recipientId]/edit"
                options={{
                    title: "Mitglied bearbeiten",
                }}
            />
            <Stack.Screen
                name="[recipientId]/p2p"
                options={{
                    title: "",
                }}
            />
        </Stack>
    );
};
