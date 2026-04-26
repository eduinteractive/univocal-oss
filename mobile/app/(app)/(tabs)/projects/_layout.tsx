import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
    return (
        <Stack screenOptions={{ headerBackTitle: "Zurück" }} initialRouteName="index">
            <Stack.Screen
                name="index"
                options={{
                    title: "Projekte",
                    header: () => <HeaderFeature title="Projekte" />,
                }}
            />
            <Stack.Screen
                name="new"
                options={{
                    title: "Neues Projekt",
                }}
            />
            <Stack.Screen
                name="[projectId]/index"
                options={{
                    title: "",
                }}
            />
            <Stack.Screen
                name="[projectId]/edit"
                options={{
                    title: "Projekt bearbeiten",
                }}
            />
            <Stack.Screen
                name="[projectId]/columns/new"
                options={{
                    title: "Neue Spalte"
                }}
            />
            <Stack.Screen
                name="[projectId]/columns/[columnId]/newTask"
                options={{
                    title: "Neue Aufgabe",
                }}
            />
            <Stack.Screen
                name="[projectId]/tasks/[taskId]/index"
                options={{
                    title: "",
                }}
            />
            <Stack.Screen
                name="[projectId]/tasks/[taskId]/edit"
                options={{
                    title: "Aufgabe bearbeiten",
                }}
            />

        </Stack>
    );
};
