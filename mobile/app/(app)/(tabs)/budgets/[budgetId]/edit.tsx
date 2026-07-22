import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCMetaForm from "@/components/common/UVCMetaForm";
import { getBudget, updateBudget } from "@/api/Budget";
import { Flex, Switch, Text } from "@eduinteractive/balladui";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { budgetId } = useLocalSearchParams();
	const [loading, setLoading] = useState(false);
	const [istActive, setIstActive] = useState(false);
	const [receiptActive, setReceiptActive] = useState(false);
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

	useEffect(() => {
		if (budgetQuery.data) {
			setIstActive(!!budgetQuery.data.budget.ist_active);
			setReceiptActive(!!budgetQuery.data.budget.receipt_active);
		}
	}, [budgetQuery.data]);

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
			queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
			queryClient.invalidateQueries({ queryKey: ["budget-receipts", budgetId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: {
		title: string;
		description?: string;
		viewAccess: number;
	}) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!._id,
				budgetId: budgetId as string,
				body: {
					title: data.title,
					description: data.description,
					viewAccess: data.viewAccess,
					ist_active: istActive,
					receipt_active: receiptActive,
				},
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	if (budgetQuery.isLoading || !budgetQuery.data) {
		return <UVCLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<UVCMetaForm
				data={budgetQuery.data.budget}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
				after={
					<Flex direction="column" gap="md">
						<Flex direction="row" align="center" gap="md">
							<Switch
								checked={istActive}
								onChange={(checked) => {
									setIstActive(checked);
									if (!checked) setReceiptActive(false);
								}}
							/>
							<Flex flex={1} direction="column">
								<Text fs="smd" fw="bold">
									Ist-Spalte
								</Text>
								<Text fs="sm">
									Zeigt den aktuell ausgegebenen Betrag neben dem
									geplanten Soll-Wert an.
								</Text>
							</Flex>
						</Flex>
						<Flex direction="row" align="center" gap="md">
							<Switch
								checked={receiptActive}
								onChange={(checked) => setReceiptActive(checked)}
								disabled={!istActive}
							/>
							<Flex flex={1} direction="column">
								<Text fs="smd" fw="bold">
									Belegerfassung
								</Text>
								<Text fs="sm">
									Ermöglicht das Hinterlegen von Belegen. Der
									Ist-Wert wird dann automatisch aus den Belegen
									berechnet.
								</Text>
							</Flex>
						</Flex>
					</Flex>
				}
			/>
		</KeyboardAvoidingView>
	);
};
