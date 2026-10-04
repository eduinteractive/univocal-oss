import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { createBudgetReceipt, getBudget } from "@/api/Budget";
import BudgetReceiptForm from "@/components/features/budget/BudgetReceiptForm";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";

export default () => {
	const { budgetId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();

	const budgetQuery = useQuery({
		queryKey: ["budget", budgetId],
		queryFn: () =>
			getBudget({
				tenantId: currentTenant!._id,
				budgetId: budgetId as string,
			}),
		enabled: !!currentTenant && !!budgetId,
	});

	const createMutation = useMutation({
		mutationFn: createBudgetReceipt,
		onSuccess: () => {
			NotificationHandler.showSuccess("Beleg wurde erstellt");
			queryClient.invalidateQueries({ queryKey: ["budget-receipts", budgetId] });
			queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	if (budgetQuery.isLoading || !budgetQuery.data) {
		return <UVCLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<ScrollView
				style={{ backgroundColor: "white" }}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<BudgetReceiptForm
					positions={budgetQuery.data.positions}
					loading={createMutation.isPending}
					onSubmit={(body) =>
						createMutation.mutate({
							tenantId: currentTenant!._id,
							budgetId: budgetId as string,
							body: {
								positionId: body.positionId,
								amount: body.amount,
								description: body.description,
								date: body.date,
								newFile: body.newFile,
							},
						})
					}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
