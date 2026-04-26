import { useRouter } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createSVHMetadataAttrs } from "@/api/APIHandler";
import SVHMetaForm, { SVHMetaFormSubmit } from "@/components/common/SVHMetaForm";
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

	const handleSubmit = async (data: SVHMetaFormSubmit) => {
		const body: createSVHMetadataAttrs = {
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
			<SVHMetaForm
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
