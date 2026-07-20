import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import SurveyGeneral from "@/components/features/survey/SurveyGeneral";
import SurveyQuestions from "@/components/features/survey/SurveyQuestions";
import SurveyExecution from "@/components/features/survey/SurveyExecution";
import SurveyResults from "@/components/features/survey/SurveyResults";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSurvey, updateSurvey, generateSurveyCodes, resetSurveyCodes, updateSurveyComponentOrder, deleteSurvey } from "@/api/Survey";
import { useTenant } from "@/context/TenantContext";
import UVCLoader from "@/components/common/UVCLoader";
import { useLayoutEffect, useMemo } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { applyColor, Button, Tabs } from "@eduinteractive/balladui";
import { IconEdit, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";
import { Alert } from "react-native";

export default () => {
	const { surveyId } = useLocalSearchParams<{ surveyId: string }>();
	const { currentTenant } = useTenant();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const surveyQuery = useQuery({
		queryKey: ["survey", currentTenant?.tenant!._id, surveyId],
		queryFn: () =>
			getSurvey({
				surveyId: surveyId,
				tenantId: currentTenant!.tenant!._id,
			}),
	});

	const updateMutation = useMutation({
		mutationFn: updateSurvey,
		onSuccess: () => {
			NotificationHandler.showSuccess("Umfrage erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

    const deleteMutation = useMutation({
        mutationFn: deleteSurvey,
        onSuccess: () => {
            NotificationHandler.showSuccess("Umfrage erfolgreich gelöscht");
            queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
        },
        onError: NotificationHandler.showAxiosError,
    });

	const generateCodesMutation = useMutation({
		mutationFn: generateSurveyCodes,
		onSuccess: () => {
			NotificationHandler.showSuccess("Umfragecodes erfolgreich generiert");
			queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const resetCodesMutation = useMutation({
		mutationFn: resetSurveyCodes,
		onSuccess: () => {
			NotificationHandler.showSuccess("Umfragecodes erfolgreich zurückgesetzt");
			queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const updateComponentOrderMutation = useMutation({
		mutationFn: updateSurveyComponentOrder,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleUpdateSurvey = async (data: { isActive: boolean }) => {
		await updateMutation.mutateAsync({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId,
			body: {
				options: {
					isActive: data.isActive,
				},
			},
		});
		queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
	};

	const handleGenerateCodes = async (amount: number) => {
		await generateCodesMutation.mutateAsync({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId,
			body: {
				amount,
			},
		});
		queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
	};

	const handleResetCodes = async () => {
		await resetCodesMutation.mutateAsync({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId,
		});
		queryClient.invalidateQueries({ queryKey: ["survey", currentTenant?.tenant!._id, surveyId] });
	};

	const handleMoveUp = (componentId: string) => {
		updateComponentOrderMutation.mutate({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId,
			componentId,
			body: { order: 1 }, // 1 = move up
		});
	};

	const handleMoveDown = (componentId: string) => {
		updateComponentOrderMutation.mutate({
			tenantId: currentTenant!.tenant!._id,
			surveyId: surveyId,
			componentId,
			body: { order: -1 }, // -1 = move down
		});
	};

    const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diese Umfrage wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteMutation.mutateAsync({
							tenantId: currentTenant!._id,
							surveyId: surveyId as string,
						});
					} catch (error) {
						Alert.alert("Fehler", "Die Umfrage konnte nicht gelöscht werden.");
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (surveyQuery.data) {
			navigation.setOptions({
				title: surveyQuery.data.survey.title,
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "edit") router.push(`/survey/${surveyId}/edit` as RelativePathString);
                            if (value === "delete") handleDelete();
                        }}
                    />
				),
			});
		}
	}, [surveyQuery.data]);

	const tabs = useMemo(
		() => [
			{
				value: "general",
				label: "Allgemein",
				component: <SurveyGeneral data={surveyQuery.data} />,
			},
			{
				value: "questions",
				label: "Fragen",
				component: (
					<SurveyQuestions 
						data={surveyQuery.data} 
						onMoveUp={handleMoveUp}
						onMoveDown={handleMoveDown}
					/>
				),
			},
			{
				value: "execution",
				label: "Durchführung",
				component: (
					<SurveyExecution
						data={surveyQuery.data}
						onUpdate={handleUpdateSurvey}
						onGenerateCodes={handleGenerateCodes}
						onResetCodes={handleResetCodes}
					/>
				),
			},
			{
				value: "results",
				label: "Ergebnisse",
				component: (
					<SurveyResults
						data={surveyQuery.data}
						refreshing={surveyQuery.isRefetching}
						onRefresh={surveyQuery.refetch}
					/>
				),
			},
		],
		[surveyQuery.data, surveyQuery.isRefetching]
	);

	if (surveyQuery.isLoading) {
		return <UVCLoader />;
	}

	return (
		<Tabs
			bg="white"
            pt="sm"
			tabs={tabs}
			initialValue={"general"}
		/>
	);
};
