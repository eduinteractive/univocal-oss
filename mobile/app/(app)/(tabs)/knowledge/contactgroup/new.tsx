import { useRouter } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContactGroup } from "@/api/Contact";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createUVCMetadataAttrs } from "@/api/APIHandler";
import UVCMetaForm, { UVCMetaFormSubmit } from "@/components/common/UVCMetaForm";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";

export default () => {
	const router = useRouter();
	const { currentTenant } = useTenant();
    const queryClient = useQueryClient();

	const createContactGroupMutation = useMutation({
		mutationFn: createContactGroup,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Kontaktgruppe wurde erfolgreich erstellt");
            queryClient.invalidateQueries({
                queryKey: ["contactGroups", currentTenant?._id, {}],
            });
            console.log(data);
			router.replace(`/knowledge/contactgroup/${data._id}`);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: UVCMetaFormSubmit) => {
		const body: createUVCMetadataAttrs = {
			title: data.title,
			description: data.description,
			viewAccess: data.viewAccess,
		};

		createContactGroupMutation.mutate({
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
				loading={createContactGroupMutation.isPending}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
                }}
			/>
		</KeyboardAvoidingView>
	);
}
