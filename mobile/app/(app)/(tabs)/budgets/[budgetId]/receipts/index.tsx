import {
	RelativePathString,
	router,
	useLocalSearchParams,
	useNavigation,
} from "expo-router";
import {
	Alert,
	Linking,
	RefreshControl,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { useLayoutEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
	ActionSheet,
	applyColor,
	Box,
	FAB,
	Flex,
	Text,
} from "@eduinteractive/balladui";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { GROUP_PERMISSION_LEVEL } from "@/api/Auth";
import {
	BudgetPosition,
	deleteBudgetReceipt,
	getBudget,
	getBudgetReceiptDownloadUrl,
	getBudgetReceipts,
} from "@/api/Budget";
import { MOCK_BUDGET_RECEIPTS } from "@/api/BudgetReceiptMock";
import UVCLoader from "@/components/common/UVCLoader";
import { IconPlus, IconTrash } from "@/assets/icons/Icon";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { BASE_URL } from "@/api/APIHandler";

export default () => {
	const { budgetId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const { authData } = useAuth();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = useState(false);

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

	const canEdit = useMemo(() => {
		const budget = budgetQuery.data?.budget;
		if (!budget || !currentTenant) return false;
		const isModeratorOrAdmin =
			currentTenant.permissionLevel === GROUP_PERMISSION_LEVEL.MODERATOR ||
			currentTenant.permissionLevel === GROUP_PERMISSION_LEVEL.ADMIN;
		return isModeratorOrAdmin || budget.authorId === authData?._id;
	}, [budgetQuery.data?.budget, currentTenant, authData?._id]);

	const deleteMutation = useMutation({
		mutationFn: deleteBudgetReceipt,
		onSuccess: () => {
			NotificationHandler.showSuccess("Beleg wurde gelöscht");
			queryClient.invalidateQueries({ queryKey: ["budget-receipts", budgetId] });
			queryClient.invalidateQueries({ queryKey: ["budget", budgetId] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Belege",
			headerRight: undefined,
		});
	}, [navigation]);

	const sortedReceipts = useMemo(() => {
		return [...(receiptsQuery.data || [])].sort(
			(a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
		);
	}, [receiptsQuery.data]);

	const getPositionTitle = (positionId: string, positions: BudgetPosition[]) => {
		const position = positions.find((p) => p._id === positionId);
		if (!position) return "–";
		if (position.without_assignment) return "Nicht zugeordnet";
		return position.title;
	};

	const handleLongPress = (receiptId: string) => {
		if (!canEdit) return;
		setSelectedReceiptId(receiptId);
		setActionSheetOpen(true);
	};

	const handleOpen = (receiptId: string) => {
		if (!canEdit) return;
		router.navigate(
			`/budgets/${budgetId}/receipts/${receiptId}/edit` as RelativePathString
		);
	};

	const handleDelete = () => {
		if (!selectedReceiptId) return;
		Alert.alert("Beleg löschen", "Möchtest du diesen Beleg wirklich löschen?", [
			{ text: "Abbrechen", style: "cancel" },
			{
				text: "Löschen",
				style: "destructive",
				onPress: () => {
					deleteMutation.mutate({
						tenantId: currentTenant!._id,
						budgetId: budgetId as string,
						receiptId: selectedReceiptId,
					});
					setActionSheetOpen(false);
					setSelectedReceiptId(null);
				},
			},
		]);
	};

	const handleOpenFile = (
		receiptId: string,
		file: { title: string; link: string; mimetype: string }
	) => {
		if (MOCK_BUDGET_RECEIPTS && file.link.startsWith("file:")) {
			Linking.openURL(file.link);
			return;
		}
		const url = getBudgetReceiptDownloadUrl(
			currentTenant!._id,
			budgetId as string,
			receiptId,
			file.link
		);
		Linking.openURL(url.startsWith("http") ? url : `${BASE_URL}${url}`);
	};

	if (budgetQuery.isLoading || receiptsQuery.isLoading) {
		return <UVCLoader />;
	}

	const positions = budgetQuery.data?.positions || [];
	const borderColor = applyColor("gray.3");

	return (
		<Box flex={1}>
			<ScrollView
				style={{ flex: 1, backgroundColor: "white" }}
				contentContainerStyle={{ paddingBottom: canEdit ? 120 : 24 }}
				refreshControl={
					<RefreshControl
						refreshing={receiptsQuery.isRefetching}
						onRefresh={receiptsQuery.refetch}
					/>
				}
			>
				<Flex direction="column">
					{sortedReceipts.length === 0 ? (
						<Flex flex={1} justify="center" align="center" py="xl">
							<Text c="gray.5">Noch keine Belege vorhanden</Text>
						</Flex>
					) : (
						sortedReceipts.map((receipt) => {
							const content = (
								<Box
									px="md"
									py="md"
									style={{
										borderBottomWidth: 1,
										borderBottomColor: borderColor,
									}}
								>
									<Flex direction="column" gap="xs">
										<Text fw="600">
											{Number(receipt.amount).toFixed(2)} €
										</Text>
										<Text fs="sm" c="gray.6">
											{dayjs(receipt.date).format("DD.MM.YYYY")}
										</Text>
										<Text fs="sm">
											{getPositionTitle(receipt.positionId, positions)}
										</Text>
										{!!receipt.description && (
											<Text fs="sm" c="gray.6" numberOfLines={2}>
												{receipt.description}
											</Text>
										)}
										{!!receipt.file && (
											<TouchableOpacity
												onPress={() =>
													handleOpenFile(receipt._id, receipt.file!)
												}
											>
												<Text fs="sm" c="blue">
													{receipt.file.title}
												</Text>
											</TouchableOpacity>
										)}
									</Flex>
								</Box>
							);

							if (!canEdit) {
								return <Box key={receipt._id}>{content}</Box>;
							}

							return (
								<TouchableOpacity
									key={receipt._id}
									onPress={() => handleOpen(receipt._id)}
									onLongPress={() => handleLongPress(receipt._id)}
									delayLongPress={500}
									activeOpacity={0.7}
								>
									{content}
								</TouchableOpacity>
							);
						})
					)}
				</Flex>
			</ScrollView>

			{canEdit && (
				<FAB
					p="smd"
					px="md"
					color="dark"
					onPress={() =>
						router.navigate(
							`/budgets/${budgetId}/receipts/new` as RelativePathString
						)
					}
				>
					<Flex direction="row" align="center" gap="sm">
						<IconPlus size={18} color="white" />
						<Text fs="sm" fw="bold" c="white">
							Neuer Beleg
						</Text>
					</Flex>
				</FAB>
			)}

			<ActionSheet
				visible={actionSheetOpen}
				onClose={() => {
					setActionSheetOpen(false);
					setSelectedReceiptId(null);
				}}
				title="Aktion"
				options={[
					{
						label: "Löschen",
						value: "delete",
						icon: <IconTrash size={20} />,
					},
				]}
				onSelect={(option) => {
					if (option === "delete") {
						handleDelete();
					}
				}}
			/>
		</Box>
	);
};
