import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSurvey, updateSurvey, SurveyExecutionMode } from "@/api/Survey";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import SVHLoader from "@/components/common/SVHLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import SVHMetaForm from "@/components/common/SVHMetaForm";
import { Select } from "@eduinteractive/balladui";

const SURVEY_EXECUTION_MODE_STRINGS = {
	[SurveyExecutionMode.DEFAULT]: "Standard - Anonym ohne Einschränkungen",
	[SurveyExecutionMode.ANONYMOUS]: "Anonym - Nur eine Antwort pro Gerät",
	[SurveyExecutionMode.PERSONAL]: "Personalisiert",
	[SurveyExecutionMode.TAN]: "Umfragecodes",
};

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { surveyId } = useLocalSearchParams();
	const [loading, setLoading] = useState(false);
	const navigation = useNavigation();
	const [executionMode, setExecutionMode] = useState<SurveyExecutionMode>(SurveyExecutionMode.DEFAULT);

	const surveyQuery = useQuery({
		queryKey: ["survey", currentTenant?._id, surveyId],
		queryFn: () =>
			getSurvey({
				tenantId: currentTenant!._id,
				surveyId: surveyId as string,
			}),
		enabled: !!surveyId && !!currentTenant,
	});

	useLayoutEffect(() => {
		if (surveyQuery.data?.survey) {
			navigation.setOptions({
				title: surveyQuery.data.survey.title,
			});
			setExecutionMode(surveyQuery.data.survey.options.executionMode === SurveyExecutionMode.PERSONAL ? SurveyExecutionMode.DEFAULT : surveyQuery.data.survey.options.executionMode);
		}
	}, [surveyQuery.data]);

	const updateMutation = useMutation({
		mutationFn: updateSurvey,
		onSuccess: () => {
			NotificationHandler.showSuccess("Umfrage erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["surveys", currentTenant!._id] });
			queryClient.invalidateQueries({ queryKey: ["survey", currentTenant!._id, surveyId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: { title: string; description?: string; viewAccess: number }) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!._id,
				surveyId: surveyId as string,
				body: {
					title: data.title,
					description: data.description,
					viewAccess: data.viewAccess,
					options: {
						executionMode,
					},
				},
			});
		} finally {
			setLoading(false);
		}
	};

	if (surveyQuery.isLoading || !surveyQuery.data) {
		return <SVHLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<SVHMetaForm
				data={surveyQuery.data.survey}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
			>
				<Select
					label="Ausführungsmodus"
					placeholder="Ausführungsmodus auswählen..."
					size="sm"
					options={Object.entries(SURVEY_EXECUTION_MODE_STRINGS).filter(([key]) => key !== SurveyExecutionMode.PERSONAL).map(([key, label]) => ({
						label,
						value: key,
					}))}
					value={executionMode}
					onChange={(value) => {
						setExecutionMode(value as SurveyExecutionMode);
					}}
				/>
			</SVHMetaForm>
		</KeyboardAvoidingView>
	);
};
