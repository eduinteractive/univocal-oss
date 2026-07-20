import { useRouter } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createUVCMetadataAttrs } from "@/api/APIHandler";
import UVCMetaForm, { UVCMetaFormSubmit } from "@/components/common/UVCMetaForm";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { createBudget } from "@/api/Budget";

export default () => {
	const router = useRouter();
	const { currentTenant } = useTenant();
    const queryClient = useQueryClient();

	const createBudgetMutation = useMutation({
		mutationFn: createBudget,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Budget wurde erfolgreich erstellt");
            queryClient.invalidateQueries({
                queryKey: ["budgets", currentTenant?._id, {}],
            });
			router.replace(`/budgets/${data._id}`);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: UVCMetaFormSubmit) => {
		const body: createUVCMetadataAttrs = {
			title: data.title,
			description: data.description,
			viewAccess: data.viewAccess,
		};

		createBudgetMutation.mutate({
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
				loading={createBudgetMutation.isPending}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
                }}
			/>
		</KeyboardAvoidingView>
	);
}
