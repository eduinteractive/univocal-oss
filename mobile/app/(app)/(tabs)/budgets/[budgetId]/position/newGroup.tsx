import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { createBudgetPosition, BudgetPositionType } from "@/api/Budget";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState, useEffect, useLayoutEffect } from "react";
import { Button, Flex, TextInput } from "@eduinteractive/balladui";

export default () => {
	const router = useRouter();
	const { budgetId, type: typeParam } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const queryClient = useQueryClient();
    const navigation = useNavigation();
    
	const [title, setTitle] = useState<string>("");
	const [type, setType] = useState<BudgetPositionType>(BudgetPositionType.GROUP_INCOME);

	useEffect(() => {
		if (typeParam === 'expense') {
			setType(BudgetPositionType.GROUP_EXPENSE);
		} else {
			setType(BudgetPositionType.GROUP_INCOME);
		}
	}, [typeParam]);

	const createGroupMutation = useMutation({
		mutationFn: createBudgetPosition,
		onSuccess: (data) => {
			NotificationHandler.showSuccess("Gruppe wurde erfolgreich erstellt");
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

		createGroupMutation.mutate({
			tenantId: currentTenant!._id,
			budgetId: budgetId as string,
			body: {
				title: title.trim(),
				description: "",
				type: type,
				soll_amount: 0, // Groups don't have amounts, they're containers
			},
		});
	};

	const getTypeDisplayName = (type: BudgetPositionType) => {
		switch (type) {
			case BudgetPositionType.GROUP_INCOME:
				return "Einnahmengruppe";
			case BudgetPositionType.GROUP_EXPENSE:
				return "Ausgabengruppe";
			default:
				return type;
		}
	};

    useLayoutEffect(() => {
        navigation.setOptions({
            title: getTypeDisplayName(type),
        });
    }, [type]);

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
						placeholder="Titel der Gruppe eingeben..."
						value={title}
						onChangeText={(text) => setTitle(text)}
						required
					/>

					<Button
						variant="filled"
						loading={createGroupMutation.isPending}
						loadingText="Bitte warten..."
						onPress={handleSubmit}
						radius="xs"
					>
						Gruppe erstellen
					</Button>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
