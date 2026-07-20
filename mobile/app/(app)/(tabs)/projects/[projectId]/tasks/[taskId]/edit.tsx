import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask } from "@/api/Project";
import { useTenant } from "@/context/TenantContext";
import { useLayoutEffect } from "react";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import useBudgets from "@/hooks/useBudgets";
import useWikis from "@/hooks/useWikis";
import useSurveys from "@/hooks/useSurveys";
import useEvents from "@/hooks/useEvents";
import useTenantMembers from "@/hooks/useTenantMembers";
import ProjectTaskForm, { ProjectTaskFormData } from "@/components/features/projects/ProjectTaskForm";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { projectId, taskId } = useLocalSearchParams();
	const navigation = useNavigation();

	// Data hooks
	const budgets = useBudgets();
	const wikis = useWikis();
	const events = useEvents();
	const surveys = useSurveys();
	const tenantMembers = useTenantMembers();

	const taskQuery = useQuery({
		queryKey: ["task", currentTenant?._id, projectId, taskId],
		queryFn: () =>
			getTask({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
				taskId: taskId as string,
			}),
		enabled: !!projectId && !!taskId && !!currentTenant,
	});

	const updateTaskMutation = useMutation({
		mutationFn: updateTask,
		onSuccess: () => {
			NotificationHandler.showSuccess("Aufgabe erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["task", currentTenant!._id, projectId, taskId] });
			queryClient.invalidateQueries({ queryKey: ["project", currentTenant!._id, projectId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: ProjectTaskFormData) => {
		try {
			await updateTaskMutation.mutateAsync({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
				taskId: taskId as string,
				body: {
					title: data.title,
					description: data.description || '',
					color: data.color || "",
					dueDate: data.dueDate ? new Date(data.dueDate) : '',
					owner: data.owner || '',
					subtasks: data.subtasks || [],
					connectors: data.connectors || [],
					materials: data.materials || [],
					newUploads: data.newUploads || undefined,
				},
			});
		} catch (error) {
			console.log(error);
		}
	};

	if (taskQuery.isLoading || !taskQuery.data) {
		return <UVCLoader />;
	}

	return (
		<ProjectTaskForm
			data={taskQuery.data}
			budgets={budgets}
			wikis={wikis}
			events={events}
			surveys={surveys}
			tenantMembers={tenantMembers}
			loading={updateTaskMutation.isPending}
			onSubmit={handleSubmit}
			submitButtonText="Aufgabe aktualisieren"
		/>
	);
};
