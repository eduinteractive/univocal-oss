import { useRouter, useNavigation } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSurvey, SurveyExecutionMode } from "@/api/Survey";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
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
	const [loading, setLoading] = useState(false);
	const navigation = useNavigation();
	const [executionMode, setExecutionMode] = useState<SurveyExecutionMode>(SurveyExecutionMode.DEFAULT);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Neue Umfrage",
		});
	}, [navigation]);

	const createMutation = useMutation({
		mutationFn: createSurvey,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Umfrage erfolgreich erstellt");
			queryClient.invalidateQueries({ queryKey: ["surveys", currentTenant!._id] });
			// Navigate to the newly created survey
			router.replace(`/survey/${data._id}`);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: { title: string; description?: string; viewAccess: number }) => {
		setLoading(true);
		try {
			await createMutation.mutateAsync({
				tenantId: currentTenant!._id,
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

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<SVHMetaForm
				data={null}
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
					options={Object.entries(SURVEY_EXECUTION_MODE_STRINGS).map(([key, label]) => ({
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
