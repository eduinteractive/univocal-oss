import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTenantProject } from "@/api/TenantProject";
import { useTenant } from "@/context/TenantContext";
import ContentEditor from "@/components/common/ContentEditor";
import { NotificationHandler } from "@/utils/NotificationHandler";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createTenantProject,
		onSuccess: () => {
			NotificationHandler.showSuccess("Projekt erfolgreich erstellt");
			queryClient.invalidateQueries({ queryKey: ["profile", currentTenant?._id] });
			queryClient.invalidateQueries({ queryKey: ["projects", currentTenant?._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSave = (data: { title: string; content: string }) => {
		if (!data.title.trim()) {
			return NotificationHandler.showError("Bitte geben Sie einen Titel ein");
		}
		if (!data.content.trim()) {
			return NotificationHandler.showError("Bitte geben Sie Inhalt ein");
		}

		createMutation.mutate({
			tenantId: currentTenant!._id,
			body: {
				title: data.title,
				content: data.content,
			},
		});
	};

	return (
		<ContentEditor
			onSave={handleSave}
			isLoading={createMutation.isPending}
		/>
	);
};
