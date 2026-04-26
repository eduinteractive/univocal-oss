import HeaderFeature from "@/components/layouts/HeaderFeature";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";

export default () => {
	const router = useRouter();
	const params = useLocalSearchParams<{ wikiId: string; sectionId: string }>();

	return (
		<Stack screenOptions={{ headerBackTitle: "Zurück"}}>
			<Stack.Screen
				name="index"
				options={{
					title: "Wissen",
					header: () => <HeaderFeature title="Wissen" />,
				}}
			/>
			<Stack.Screen
				name="wiki/new"
				options={{
					title: "Neues Wiki",
				}}
			/>
			<Stack.Screen
				name="wiki/[wikiId]/index"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="wiki/[wikiId]/section/new"
				options={{
					title: "Neues Kapitel",
				}}
			/>
			<Stack.Screen
				name="wiki/[wikiId]/section/[sectionId]/index"
				options={{
					title: "",
                }}
			/>
			<Stack.Screen
				name="wiki/[wikiId]/section/[sectionId]/edit"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="wiki/[wikiId]/section/[sectionId]/materials"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="contactgroup/[contactgroupId]/index"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="contactgroup/[contactgroupId]/edit"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="contactgroup/new"
				options={{
					title: "Neue Kontaktgruppe",
				}}
			/>
			<Stack.Screen
				name="contactgroup/[contactgroupId]/contact/new"
				options={{
					title: "Neuer Kontakt",
				}}
			/>
			<Stack.Screen
				name="contactgroup/[contactgroupId]/contact/[contactId]/edit"
				options={{
					title: "Kontakt bearbeiten",
				}}
			/>
		</Stack>
	);
};
