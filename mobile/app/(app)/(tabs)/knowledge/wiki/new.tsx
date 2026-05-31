import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWiki } from "../../../../../api/Wiki";
import { useTenant } from "../../../../../context/TenantContext";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCMetaForm from "@/components/common/UVCMetaForm";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);

	const createMutation = useMutation({
		mutationFn: createWiki,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Wiki erfolgreich erstellt");
			queryClient.invalidateQueries({ queryKey: ["wikis", currentTenant!._id] });
			router.replace(`/knowledge/wiki/${data._id}`);
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
			<UVCMetaForm
				data={null}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
			/>
		</KeyboardAvoidingView>
	);
};
