import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
    return (
        <Stack screenOptions={{ headerBackTitle: "Zurück"}}>
            <Stack.Screen
                name="index"
                options={{
                    title: "Umfragen",
                    header: () => <HeaderFeature title="Umfragen" />,
                }}
            />
            <Stack.Screen
                name="[surveyId]/index"
                options={{
                    title: "",
                }}
            />
            <Stack.Screen
                name="[surveyId]/edit"
                options={{
                    title: "",
                }}
            />
        </Stack>
    );
};
