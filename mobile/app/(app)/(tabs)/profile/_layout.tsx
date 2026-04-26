import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack } from "expo-router";

export default () => {
	return (
		<Stack
			screenOptions={{ headerBackTitle: "Zurück" }}
			initialRouteName="index"
		>
			<Stack.Screen
				name="index"
				options={{ title: "SV-Profil", header: () => <HeaderFeature title="SV-Profil" /> }}
			/>
			<Stack.Screen
				name="edit"
				options={{ title: "SV-Profil bearbeiten" }}
			/>
			<Stack.Screen
				name="news/new"
				options={{ title: "Neuigkeit erstellen" }}
			/>
			<Stack.Screen
				name="news/[newsId]/index"
				options={{ title: "Neuigkeit" }}
			/>
			<Stack.Screen
				name="news/[newsId]/edit"
				options={{ title: "Neuigkeit bearbeiten" }}
			/>
			<Stack.Screen
				name="project/new"
				options={{ title: "Projekt erstellen" }}
			/>
			<Stack.Screen
				name="project/[projectId]/index"
				options={{ title: "Projekt" }}
			/>
			<Stack.Screen
				name="project/[projectId]/edit"
				options={{ title: "Projekt bearbeiten" }}
			/>
		</Stack>
	);
};
