import React from "react";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { updateBudgetPosition, BudgetPositionType, getBudget, deleteBudgetPosition } from "@/api/Budget";
import { KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useState, useEffect, useLayoutEffect } from "react";
import { Button, Flex, TextInput, Text } from "@eduinteractive/balladui";
import { applyColor } from "@eduinteractive/balladui";
import UVCLoader from "@/components/common/UVCLoader";
import { IconTrash } from "@/assets/icons/Icon";

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

	// Get budget data to find the position/group being edited
	const budgetQuery = useQuery({
		queryKey: ["budget", budgetId],
		queryFn: () => getBudget({ tenantId: currentTenant!._id, budgetId: budgetId as string }),
	});

	const position = budgetQuery.data?.positions.find(p => p._id === positionId);
	const isBudgetActive = budgetQuery.data?.budget.ist_active;
	
	// Determine if this is a group or individual position
	const isGroup = position?.type === BudgetPositionType.GROUP_INCOME || position?.type === BudgetPositionType.GROUP_EXPENSE;
	const isIncomeGroup = position?.type === BudgetPositionType.GROUP_INCOME;
	const isExpenseGroup = position?.type === BudgetPositionType.GROUP_EXPENSE;
	const isIncomePosition = position?.type === BudgetPositionType.INCOME;
	const isExpensePosition = position?.type === BudgetPositionType.EXPENSE;

	// Load initial data when position is available
	useEffect(() => {
		if (position) {
			setTitle(position.title);
			setDescription(position.description || "");
			setSollAmount(position.soll_amount.toString().replace(".", ","));
			setIstAmount((position.ist_amount || 0).toString().replace(".", ","));
		}
	}, [position]);

	useLayoutEffect(() => {
		if (position) {
			let titleText = "";
			if (isIncomeGroup) titleText = "Einnahmengruppe bearbeiten";
			else if (isExpenseGroup) titleText = "Ausgabengruppe bearbeiten";
			else if (isIncomePosition) titleText = "Einnahme bearbeiten";
			else if (isExpensePosition) titleText = "Ausgabe bearbeiten";

			navigation.setOptions({
				title: titleText,
				headerRight: () => (
					<Button
						variant="subtle"
						size="sm"
						onPress={handleDelete}
					>
						<IconTrash
							color={applyColor("red")}
							size={20}
						/>
					</Button>
				),
			});
		}
	}, [position, navigation]);

	const updatePositionMutation = useMutation({
		mutationFn: updateBudgetPosition,
		onSuccess: (data) => {
			NotificationHandler.showSuccess(isGroup ? "Gruppe wurde erfolgreich aktualisiert" : "Position wurde erfolgreich aktualisiert");
			queryClient.invalidateQueries({
				queryKey: ["budget", budgetId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const deletePositionMutation = useMutation({
		mutationFn: deleteBudgetPosition,
		onSuccess: () => {
			NotificationHandler.showSuccess(isGroup ? "Gruppe wurde erfolgreich gelöscht" : "Position wurde erfolgreich gelöscht");
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

		let sollAmountNum = 0;
		let istAmountNum = 0;

		// For individual positions, validate amounts
		if (!isGroup) {
			sollAmountNum = parseFloat(sollAmount.replace(",", "."));
			if (isNaN(sollAmountNum) || sollAmountNum < 0) {
				return NotificationHandler.showError("Bitte gebe einen gültigen Soll-Betrag ein");
			}

			if (isBudgetActive && istAmount.trim()) {
				istAmountNum = parseFloat(istAmount.replace(",", "."));
				if (isNaN(istAmountNum) || istAmountNum < 0) {
					return NotificationHandler.showError("Bitte gebe einen gültigen Ist-Betrag ein");
				}
			}
		}

		updatePositionMutation.mutate({
			tenantId: currentTenant!._id,
			budgetId: budgetId as string,
			positionId: positionId as string,
			body: {
				title: title.trim(),
				description: description.trim(),
				type: position!.type,
				soll_amount: sollAmountNum,
				ist_amount: isBudgetActive && !isGroup ? istAmountNum : undefined,
			},
		});
	};

	const handleDelete = () => {
		const itemType = isGroup ? "Gruppe" : "Position";
		const warningMessage = isGroup 
			? "Möchtest du diese Gruppe wirklich löschen? Alle enthaltenen Positionen werden ebenfalls gelöscht."
			: "Möchtest du diese Position wirklich löschen?";

		Alert.alert(`${itemType} löschen`, warningMessage, [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: () => {
					deletePositionMutation.mutate({
						tenantId: currentTenant!._id,
						budgetId: budgetId as string,
						positionId: positionId as string,
					});
				},
			},
		]);
	};

	if (budgetQuery.isLoading) {
		return <UVCLoader />;
	}

	if (!position) {
		return (
			<Flex flex={1} justify="center" align="center">
				<Text fw="bold">{isGroup ? "Gruppe" : "Position"} nicht gefunden</Text>
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
						placeholder={isGroup ? "Titel der Gruppe eingeben..." : "Titel der Position eingeben..."}
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

					{!isGroup && (
						<>
							<TextInput
								size="sm"
								label="Soll-Betrag (€)"
								placeholder="0,00"
								value={sollAmount}
								onChangeText={(text) => setSollAmount(text)}
								keyboardType="decimal-pad"
								required
							/>

							{isBudgetActive && (
								<TextInput
									size="sm"
									label="Ist-Betrag (€)"
									placeholder="0,00"
									value={istAmount}
									onChangeText={(text) => setIstAmount(text)}
									keyboardType="decimal-pad"
								/>
							)}
						</>
					)}

					<Button
						variant="filled"
						loading={updatePositionMutation.isPending}
						loadingText="Bitte warten..."
						onPress={handleSubmit}
					>
						{isGroup ? "Gruppe" : "Position"} aktualisieren
					</Button>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
