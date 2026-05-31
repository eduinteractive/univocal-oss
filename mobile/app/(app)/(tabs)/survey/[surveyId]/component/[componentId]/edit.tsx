import React from "react";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { 
	updateSurveyComponent, 
	deleteSurveyComponent,
	getSurvey,
	SurveyComponentType
} from "@/api/Survey";
import { KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useLayoutEffect } from "react";
import { Button, Flex, Text } from "@eduinteractive/balladui";
import { applyColor } from "@eduinteractive/balladui";
import UVCLoader from "@/components/common/UVCLoader";
import SurveyComponentForm, { SurveyComponentFormData } from "@/components/features/survey/SurveyComponentForm";
import { IconTrash } from "@/assets/icons/Icon";

// Component type display names
const SurveyComponentTypeStrings: Record<SurveyComponentType, string> = {
	[SurveyComponentType.TEXT]: "Text",
	[SurveyComponentType.LIKERT]: "Likert-Skala",
	[SurveyComponentType.CHOICE]: "Multiple Choice",
	[SurveyComponentType.OPEN]: "Offene Frage",
	[SurveyComponentType.WORDCLOUD]: "Wortwolke",
	[SurveyComponentType.NOMINAL]: "Nominal",
};

export default () => {
	const router = useRouter();
	const { surveyId, componentId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const queryClient = useQueryClient();
	const navigation = useNavigation();

	// Get survey data to find the component being edited
	const surveyQuery = useQuery({
		queryKey: ["survey", currentTenant?.tenant!._id, surveyId],
		queryFn: () => getSurvey({ tenantId: currentTenant!.tenant!._id, surveyId: surveyId as string }),
	});

	const component = surveyQuery.data?.components.find(c => c._id === componentId);
	const isActive = surveyQuery.data?.survey.options.isActive || (surveyQuery.data?.results.length || 0) > 0;

	useLayoutEffect(() => {
		if (component) {
			navigation.setOptions({
				title: `${SurveyComponentTypeStrings[component.type as SurveyComponentType]} bearbeiten`,
				headerRight: () => (
					<Button
						variant="subtle"
						size="sm"
						onPress={handleDelete}
					>
						<IconTrash
							color={applyColor("red")}
							size={20}
						/>
					</Button>
				),
			});
		}
	}, [component, navigation]);

	const updateComponentMutation = useMutation({
		mutationFn: updateSurveyComponent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Komponente wurde erfolgreich aktualisiert");
			queryClient.invalidateQueries({
				queryKey: ["survey", currentTenant?.tenant!._id, surveyId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const deleteComponentMutation = useMutation({
		mutationFn: deleteSurveyComponent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Komponente wurde erfolgreich gelöscht");
			queryClient.invalidateQueries({
				queryKey: ["survey", currentTenant?.tenant!._id, surveyId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = (formData: SurveyComponentFormData) => {
		updateComponentMutation.mutate({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId as string,
			componentId: componentId as string,
			body: formData,
		});
	};

	const handleDelete = () => {
		Alert.alert("Komponente löschen", "Möchtest du diese Komponente wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: () => {
					deleteComponentMutation.mutate({
						tenantId: currentTenant!.tenant!._id,
						surveyId: surveyId as string,
						componentId: componentId as string,
					});
				},
			},
		]);
	};

	if (surveyQuery.isLoading) {
		return <UVCLoader />;
	}

	if (!component) {
		return (
			<Flex flex={1} justify="center" align="center">
				<Text fw="bold">Komponente nicht gefunden</Text>
			</Flex>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<SurveyComponentForm
				initialData={component}
				isActive={isActive}
				loading={updateComponentMutation.isPending}
				onSubmit={handleSubmit}
				submitButtonText="Komponente aktualisieren"
				showTypeSelector={false}
			/>
		</KeyboardAvoidingView>
	);
};
