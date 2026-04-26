import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import SVHLoader from "@/components/common/SVHLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import SVHMetaForm from "@/components/common/SVHMetaForm";
import { getBudget, updateBudget } from "@/api/Budget";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { budgetId } = useLocalSearchParams();
	const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    
	const budgetQuery = useQuery({
		queryKey: ["budget", currentTenant?._id, budgetId],
		queryFn: () =>
			getBudget({
				tenantId: currentTenant!._id,
				budgetId: budgetId as string,
			}),
		enabled: !!budgetId && !!currentTenant,
	});

    useLayoutEffect(() => {
        if (budgetQuery.data) {
            navigation.setOptions({
                title: budgetQuery.data.budget.title,
            });
        }
    }, [budgetQuery.data]);

	const updateMutation = useMutation({
		mutationFn: updateBudget,
		onSuccess: () => {
			NotificationHandler.showSuccess("Budget erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["budgets", currentTenant!._id, {}] });
			queryClient.invalidateQueries({ queryKey: ["budget", currentTenant!._id, budgetId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: { title: string; description?: string; viewAccess: number }) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!._id,
				budgetId: budgetId as string,
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

	if (budgetQuery.isLoading || !budgetQuery.data) {
		return <SVHLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<SVHMetaForm
				data={budgetQuery.data.budget}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
			/>
		</KeyboardAvoidingView>
	);
};
