import { useRouter } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/api/Project";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createUVCMetadataAttrs } from "@/api/APIHandler";
import UVCMetaForm, { UVCMetaFormSubmit } from "@/components/common/UVCMetaForm";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";

export default () => {
	const router = useRouter();
	const { currentTenant } = useTenant();
    const queryClient = useQueryClient();

	const createProjectMutation = useMutation({
		mutationFn: createProject,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Projekt wurde erfolgreich erstellt");
            queryClient.invalidateQueries({
                queryKey: ["projects", currentTenant?._id, {}],
            });
			router.replace(`/projects/${data._id}`);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: UVCMetaFormSubmit) => {
		const body: createUVCMetadataAttrs = {
			title: data.title,
			description: data.description,
			viewAccess: data.viewAccess,
		};

		createProjectMutation.mutate({
			tenantId: currentTenant!._id,
			body,
		});
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<UVCMetaForm
				data={null}
				loading={createProjectMutation.isPending}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
                }}
			/>
		</KeyboardAvoidingView>
	);
}
