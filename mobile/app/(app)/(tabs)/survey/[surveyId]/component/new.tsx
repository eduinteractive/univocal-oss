import React from "react";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { 
	createSurveyComponent,
	getSurvey,
	SurveyComponentType
} from "@/api/Survey";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useLayoutEffect } from "react";
import { Flex, Text } from "@eduinteractive/balladui";
import SVHLoader from "@/components/common/SVHLoader";
import SurveyComponentForm, { SurveyComponentFormData } from "@/components/features/survey/SurveyComponentForm";

export default () => {
	const router = useRouter();
	const { surveyId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const queryClient = useQueryClient();
	const navigation = useNavigation();

	// Get survey data to check if survey is active
	const surveyQuery = useQuery({
		queryKey: ["survey", currentTenant?.tenant!._id, surveyId],
		queryFn: () => getSurvey({ tenantId: currentTenant!.tenant!._id, surveyId: surveyId as string }),
	});

	const isActive = surveyQuery.data?.survey.options.isActive || (surveyQuery.data?.results.length || 0) > 0;

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Neue Komponente",
		});
	}, [navigation]);

	const createComponentMutation = useMutation({
		mutationFn: createSurveyComponent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Komponente wurde erfolgreich erstellt");
			queryClient.invalidateQueries({
				queryKey: ["survey", currentTenant?.tenant!._id, surveyId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = (formData: SurveyComponentFormData) => {
		createComponentMutation.mutate({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId as string,
			body: formData,
		});
	};

	if (surveyQuery.isLoading) {
		return <SVHLoader />;
	}

	if (!surveyQuery.data) {
		return (
			<Flex flex={1} justify="center" align="center">
				<Text fw="bold">Umfrage nicht gefunden</Text>
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
				isActive={isActive}
				loading={createComponentMutation.isPending}
				onSubmit={handleSubmit}
				submitButtonText="Komponente erstellen"
				showTypeSelector={true}
			/>
		</KeyboardAvoidingView>
	);
};
