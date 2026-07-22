import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import {
	getBudget,
	getBudgetReceipts,
	updateBudgetReceipt,
} from "@/api/Budget";
import BudgetReceiptForm from "@/components/features/budget/BudgetReceiptForm";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Flex, Text } from "@eduinteractive/balladui";

export default () => {
	const { budgetId, receiptId } = useLocalSearchParams();
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

	const receiptsQuery = useQuery({
		queryKey: ["budget-receipts", budgetId],
		queryFn: () =>
			getBudgetReceipts({
				tenantId: currentTenant!._id,
				budgetId: budgetId as string,
			}),
		enabled: !!currentTenant && !!budgetId,
	});

	const receipt = receiptsQuery.data?.find((r) => r._id === receiptId);

	const updateMutation = useMutation({
		mutationFn: updateBudgetReceipt,
		onSuccess: () => {
			NotificationHandler.showSuccess("Beleg wurde aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["budget-receipts", budgetId] });
			queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	if (budgetQuery.isLoading || receiptsQuery.isLoading) {
		return <UVCLoader />;
	}

	if (!budgetQuery.data || !receipt) {
		return (
			<Flex flex={1} justify="center" align="center">
				<Text fw="bold">Beleg nicht gefunden</Text>
			</Flex>
		);
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
					data={receipt}
					positions={budgetQuery.data.positions}
					loading={updateMutation.isPending}
					onSubmit={(body) =>
						updateMutation.mutate({
							tenantId: currentTenant!._id,
							budgetId: budgetId as string,
							receiptId: receiptId as string,
							body: {
								positionId: body.positionId!,
								amount: body.amount,
								description: body.description,
								date: body.date,
								newFile: body.newFile,
								file: body.file,
							},
						})
					}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
