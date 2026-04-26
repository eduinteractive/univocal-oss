import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenantProject, updateTenantProject } from "@/api/TenantProject";
import { useTenant } from "@/context/TenantContext";
import ContentEditor from "@/components/common/ContentEditor";
import SVHLoader from "@/components/common/SVHLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Flex, Text } from "@eduinteractive/balladui";

export default () => {
	const params = useLocalSearchParams();
	const projectId = typeof params.projectId === "string" ? params.projectId : "";
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();

	const projectQuery = useQuery({
		queryKey: ["project", currentTenant?._id, projectId],
		queryFn: () =>
			getTenantProject({
				tenantId: currentTenant!._id,
				projectId,
			}),
		enabled: !!projectId && !!currentTenant?.tenant?._id,
	});

	const updateMutation = useMutation({
		mutationFn: updateTenantProject,
		onSuccess: () => {
			NotificationHandler.showSuccess("Projekt erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["project", currentTenant?._id, projectId] });
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

		updateMutation.mutate({
			tenantId: currentTenant!._id,
			projectId,
			body: {
				title: data.title,
				content: data.content,
				image: projectQuery.data?.image,
			},
		});
	};

	if (projectQuery.isLoading) {
		return <SVHLoader />;
	}

	if (projectQuery.error) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text
					fs="sm"
					fw="bold"
				>
					Fehler beim Laden des Projekts
				</Text>
			</Flex>
		);
	}

	if (!projectQuery.data) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text
					fs="sm"
					fw="bold"
				>
					Projekt nicht gefunden
				</Text>
			</Flex>
		);
	}

	return (
		<ContentEditor
			initialTitle={projectQuery.data.title}
			initialContent={projectQuery.data.content}
			onSave={handleSave}
			isLoading={updateMutation.isPending}
		/>
	);
};
