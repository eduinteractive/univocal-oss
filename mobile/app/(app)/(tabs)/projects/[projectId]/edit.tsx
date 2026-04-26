import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProject, updateProject } from "@/api/Project";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import SVHLoader from "@/components/common/SVHLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import SVHMetaForm from "@/components/common/SVHMetaForm";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { projectId } = useLocalSearchParams();
	const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    
	const projectQuery = useQuery({
		queryKey: ["project", currentTenant?._id, projectId],
		queryFn: () =>
			getProject({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
			}),
		enabled: !!projectId && !!currentTenant,
	});

    useLayoutEffect(() => {
        if (projectQuery.data) {
            navigation.setOptions({
                title: projectQuery.data.title,
            });
        }
    }, [projectQuery.data]);

	const updateMutation = useMutation({
		mutationFn: updateProject,
		onSuccess: () => {
			NotificationHandler.showSuccess("Projekt erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["projects", currentTenant!._id, {}] });
			queryClient.invalidateQueries({ queryKey: ["project", currentTenant!._id, projectId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: { title: string; description?: string; viewAccess: number }) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
				body: {
					title: data.title,
					description: data.description,
					viewAccess: data.viewAccess,
				},
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	if (projectQuery.isLoading || !projectQuery.data) {
		return <SVHLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<SVHMetaForm
				data={projectQuery.data}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
			/>
		</KeyboardAvoidingView>
	);
};
