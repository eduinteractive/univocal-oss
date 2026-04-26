import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/api/Project";
import { useTenant } from "@/context/TenantContext";
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
	const { projectId, columnId } = useLocalSearchParams();
	const navigation = useNavigation();

	// Data hooks
	const budgets = useBudgets();
	const wikis = useWikis();
	const events = useEvents();
	const surveys = useSurveys();
	const tenantMembers = useTenantMembers();

	const createTaskMutation = useMutation({
		mutationFn: createTask,
		onSuccess: () => {
			NotificationHandler.showSuccess("Aufgabe erfolgreich erstellt");
			queryClient.invalidateQueries({ queryKey: ["project", currentTenant!._id, projectId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: ProjectTaskFormData) => {
		try {
			await createTaskMutation.mutateAsync({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
				body: {
					title: data.title,
					description: data.description || '',
					color: data.color || "",
					dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
					owner: data.owner || '',
					subtasks: data.subtasks || [],
					connectors: data.connectors || [],
					materials: data.materials || [],
					colId: columnId as string,
					newUploads: data.newUploads || undefined,
				},
			});
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<ProjectTaskForm
			data={null}
			budgets={budgets}
			wikis={wikis}
			events={events}
			surveys={surveys}
			tenantMembers={tenantMembers}
			loading={createTaskMutation.isPending}
			onSubmit={handleSubmit}
			submitButtonText="Aufgabe erstellen"
		/>
	);
};
