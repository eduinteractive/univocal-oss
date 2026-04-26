import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
    return (
        <Stack screenOptions={{ headerBackTitle: "Zurück"}}>
            <Stack.Screen
                name="index"
                options={{
                    title: "Finanzen",
                    header: () => <HeaderFeature title="Finanzen" />,
                }}
            />
            <Stack.Screen
                name="new"
                options={{
                    title: "Neues Budget",
                }}
            />
            <Stack.Screen
                name="[budgetId]/index"
                options={{
                    title: "Budget",
                }}
            />
            <Stack.Screen
                name="[budgetId]/edit"
                options={{
                    title: "Budget bearbeiten",
                }}
            />
            <Stack.Screen
                name="[budgetId]/position/newGroup"
                options={{
                    title: "Gruppe erstellen",
                }}
            />
            <Stack.Screen
                name="[budgetId]/position/[positionId]/new"
                options={{
                    title: "Position erstellen",
                }}
            />
            <Stack.Screen
                name="[budgetId]/position/[positionId]/edit"
                options={{
                    title: "Position bearbeiten",
                }}
            />
        </Stack>
    );
};
