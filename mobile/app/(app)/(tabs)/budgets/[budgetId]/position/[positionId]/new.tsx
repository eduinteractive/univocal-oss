import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createBudgetPosition, BudgetPositionType, getBudget } from "@/api/Budget";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState, useLayoutEffect } from "react";
import { Button, Flex, TextInput, Text } from "@eduinteractive/balladui";

export default () => {
	const router = useRouter();
	const { budgetId, positionId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const queryClient = useQueryClient();
	const navigation = useNavigation();

	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [sollAmount, setSollAmount] = useState<string>("");
	const [istAmount, setIstAmount] = useState<string>("");

	// Get budget data to find the parent group and determine if budget is active
	const budgetQuery = useQuery({
		queryKey: ["budget", budgetId],
		queryFn: () => getBudget({ tenantId: currentTenant!._id, budgetId: budgetId as string }),
	});

	const parentGroup = budgetQuery.data?.positions.find(p => p._id === positionId);
	const isIncomeGroup = parentGroup?.type === BudgetPositionType.GROUP_INCOME;
	const isExpenseGroup = parentGroup?.type === BudgetPositionType.GROUP_EXPENSE;
	const isBudgetActive = budgetQuery.data?.budget.ist_active;
	const receiptActive = !!budgetQuery.data?.budget.receipt_active;
	const showManualIst = isBudgetActive && !receiptActive;

	const positionType = isIncomeGroup 
		? BudgetPositionType.INCOME 
		: BudgetPositionType.EXPENSE;

	useLayoutEffect(() => {
		if (parentGroup) {
			const typeLabel = isIncomeGroup ? "Einnahme" : "Ausgabe";
			navigation.setOptions({
				title: `${typeLabel} zu "${parentGroup.title}"`,
			});
		}
	}, [parentGroup, navigation]);

	const createPositionMutation = useMutation({
		mutationFn: createBudgetPosition,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Position wurde erfolgreich erstellt");
			queryClient.invalidateQueries({
				queryKey: ["budget", budgetId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async () => {
		if (!title.trim()) {
			return NotificationHandler.showError("Bitte gebe einen Titel ein");
		}

		const sollAmountNum = parseFloat(sollAmount.replace(",", "."));
		if (isNaN(sollAmountNum) || sollAmountNum < 0) {
			return NotificationHandler.showError("Bitte gebe einen gültigen Soll-Betrag ein");
		}

		let istAmountNum = 0;
		if (showManualIst && istAmount.trim()) {
			istAmountNum = parseFloat(istAmount.replace(",", "."));
			if (isNaN(istAmountNum) || istAmountNum < 0) {
				return NotificationHandler.showError("Bitte gebe einen gültigen Ist-Betrag ein");
			}
		}

		createPositionMutation.mutate({
			tenantId: currentTenant!._id,
			budgetId: budgetId as string,
			body: {
				title: title.trim(),
				description: description.trim(),
				type: positionType,
				soll_amount: sollAmountNum,
				ist_amount: showManualIst ? istAmountNum : undefined,
				parent: positionId as string,
			},
		});
	};

	if (budgetQuery.isLoading) {
		return (
			<Flex flex={1} justify="center" align="center">
				<Text>Lade...</Text>
			</Flex>
		);
	}

	if (!parentGroup) {
		return (
			<Flex flex={1} justify="center" align="center">
				<Text fw="bold">Gruppe nicht gefunden</Text>
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
				<Flex
					direction="column"
					gap="lg"
					p="md"
					pb={250}
				>
					<TextInput
						size="sm"
						label="Titel"
						placeholder="Titel der Position eingeben..."
						value={title}
						onChangeText={(text) => setTitle(text)}
						required
					/>

					<TextInput
						size="sm"
						label="Beschreibung"
						placeholder="Beschreibung eingeben..."
						value={description}
						onChangeText={(text) => setDescription(text)}
						multiline
						numberOfLines={3}
					/>

					<TextInput
						size="sm"
						label="Soll-Betrag (€)"
						placeholder="0,00"
						value={sollAmount}
						onChangeText={(text) => setSollAmount(text)}
						keyboardType="decimal-pad"
						required
					/>

					{showManualIst && (
						<TextInput
							size="sm"
							label="Ist-Betrag (€)"
							placeholder="0,00"
							value={istAmount}
							onChangeText={(text) => setIstAmount(text)}
							keyboardType="decimal-pad"
						/>
					)}
					{receiptActive && isBudgetActive && (
						<Text fs="sm" c="gray.6">
							Der Ist-Betrag wird aus den Belegen dieser Position berechnet.
						</Text>
					)}

					<Button
						variant="filled"
						loading={createPositionMutation.isPending}
						loadingText="Bitte warten..."
						onPress={handleSubmit}
						radius="xs"
					>
						Position erstellen
					</Button>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
