import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWiki, updateWiki } from "@/api/Wiki";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCMetaForm from "@/components/common/UVCMetaForm";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { wikiId } = useLocalSearchParams();
	const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    
	const wikiQuery = useQuery({
		queryKey: ["wiki", currentTenant?._id, wikiId],
		queryFn: () =>
			getWiki({
				tenantId: currentTenant!._id,
				wikiId: wikiId as string,
			}),
		enabled: !!wikiId && !!currentTenant,
	});

    useLayoutEffect(() => {
        if (wikiQuery.data) {
            navigation.setOptions({
                title: wikiQuery.data.title,
            });
        }
    }, [wikiQuery.data]);

	const updateMutation = useMutation({
		mutationFn: updateWiki,
		onSuccess: () => {
			NotificationHandler.showSuccess("Wiki erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["wikis", currentTenant!._id] });
			queryClient.invalidateQueries({ queryKey: ["wiki", currentTenant!._id, wikiId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: { title: string; description?: string; viewAccess: number }) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!._id,
				wikiId: wikiId as string,
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

	if (wikiQuery.isLoading || !wikiQuery.data) {
		return <UVCLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<UVCMetaForm
				data={wikiQuery.data}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
			/>
		</KeyboardAvoidingView>
	);
};
