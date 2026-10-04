import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import { ScrollView, RefreshControl, Alert } from "react-native";
import UVCLoader from "@/components/common/UVCLoader";
import {
	deleteBudget,
	getBudget,
	getBudgetReceipts,
	getPositionIstAmount,
	BudgetPosition,
	BudgetPositionType,
	BudgetReceipt,
} from "@/api/Budget";
import { useTenant } from "@/context/TenantContext";
import { useLayoutEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { applyColor, Box, Button, Card, Divider, Flex, Text } from "@eduinteractive/balladui";
import { IconEdit, IconTrash, IconPlus } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

interface BudgetGroupsWithPosition {
	group: BudgetPosition;
	positions: BudgetPosition[];
}

const sortGroups = (groups: BudgetGroupsWithPosition[]) => {
	return [...groups].sort((a, b) => {
		const aUnassigned = a.group.without_assignment || a.positions.some((p) => p.without_assignment);
		const bUnassigned = b.group.without_assignment || b.positions.some((p) => p.without_assignment);
		if (aUnassigned === bUnassigned) return 0;
		return aUnassigned ? 1 : -1;
	});
};

export default () => {
	const { budgetId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const budgetQuery = useQuery({
		queryKey: ["budget", budgetId],
		queryFn: () => getBudget({ tenantId: currentTenant!._id, budgetId: budgetId as string }),
	});

	const receiptActive = !!budgetQuery.data?.budget.receipt_active;
	const istActive = !!budgetQuery.data?.budget.ist_active;

	const receiptsQuery = useQuery({
		queryKey: ["budget-receipts", budgetId],
		queryFn: () =>
			getBudgetReceipts({
				tenantId: currentTenant!._id,
				budgetId: budgetId as string,
			}),
		enabled: !!currentTenant && !!budgetId && receiptActive,
	});

	const receipts: BudgetReceipt[] = receiptsQuery.data || [];

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du dieses Budget wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteBudget({
							tenantId: currentTenant!._id,
							budgetId: budgetId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["budgets", currentTenant?._id, {}],
						});
						queryClient.invalidateQueries({
							queryKey: ["budget", currentTenant?._id, budgetId],
						});
					} catch (error) {
						Alert.alert("Fehler", "Das Budget konnte nicht gelöscht werden.");
					} finally {
						router.back();
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (budgetQuery.data) {
			navigation.setOptions({
				title: budgetQuery.data.budget.title,
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "edit") router.navigate(`/budgets/${budgetId}/edit` as RelativePathString);
                            if (value === "delete") handleDelete();
                        }}
                    />
				),
			});
		}
	}, [budgetQuery.data, navigation]);

	if (budgetQuery.isLoading) {
		return <UVCLoader />;
	}

	if (!budgetQuery.data) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text fw="bold">Budget nicht gefunden</Text>
			</Flex>
		);
	}

	const { positions } = budgetQuery.data;

	const incomeGroups: BudgetGroupsWithPosition[] = [];
	const expenseGroups: BudgetGroupsWithPosition[] = [];

	positions.forEach((position) => {
		if (position.type === BudgetPositionType.GROUP_INCOME) {
			incomeGroups.push({
				group: position,
				positions: positions.filter((p) => p.parent === position._id),
			});
		} else if (position.type === BudgetPositionType.GROUP_EXPENSE) {
			expenseGroups.push({
				group: position,
				positions: positions.filter((p) => p.parent === position._id),
			});
		}
	});

	const sortedIncomeGroups = sortGroups(incomeGroups);
	const sortedExpenseGroups = sortGroups(expenseGroups);

	const totalIncome = sortedIncomeGroups.reduce(
		(sum, group) => sum + group.positions.reduce((s, position) => s + position.soll_amount, 0),
		0
	);

	const totalExpenses = sortedExpenseGroups.reduce(
		(sum, group) => sum + group.positions.reduce((s, position) => s + position.soll_amount, 0),
		0
	);

	const totalActualIncome = sortedIncomeGroups.reduce(
		(sum, group) =>
			sum +
			group.positions.reduce(
				(s, position) => s + getPositionIstAmount(position, receipts, receiptActive),
				0
			),
		0
	);

	const totalActualExpenses = sortedExpenseGroups.reduce(
		(sum, group) =>
			sum +
			group.positions.reduce(
				(s, position) => s + getPositionIstAmount(position, receipts, receiptActive),
				0
			),
		0
	);

	const renderGroup = (group: BudgetGroupsWithPosition) => (
		<Card
			key={group.group._id}
			variant="outline"
			radius="xs"
			p="sm"
			color="gray.2"
		>
			<Flex
				direction="row"
				justify="space-between"
				align="center"
				pb="md"
			>
				<Button
					variant="subtle"
					size="xs"
					onPress={() => {
						router.navigate(
							`/budgets/${budgetId}/position/${group.group._id}/edit` as RelativePathString
						);
					}}
					style={{ flex: 1, justifyContent: "flex-start" }}
					pl={0}
				>
					<Text fw="600">{group.group.title}</Text>
				</Button>
				<Button
					variant="subtle"
					size="sm"
					onPress={() => {
						router.navigate(
							`/budgets/${budgetId}/position/${group.group._id}/new` as RelativePathString
						);
					}}
				>
					<IconPlus size={16} color={applyColor("gray.6")} />
				</Button>
			</Flex>
			<Flex direction="row" justify="space-between" mb="sm" pr="sm">
				<Text c="gray.5">Position</Text>
				<Flex direction="row" gap="xl">
					<Text c="gray.5" mr="md">
						Soll
					</Text>
					{istActive && <Text c="gray.5">Ist</Text>}
				</Flex>
			</Flex>
			<Divider my="sm" color="gray.2" />
			{group.positions.map((position) => (
				<Box key={position._id} mb="xs">
					<Button
						variant="subtle"
						size="sm"
						onPress={() => {
							router.navigate(
								`/budgets/${budgetId}/position/${position._id}/edit` as RelativePathString
							);
						}}
						style={{
							width: "100%",
							justifyContent: "space-between",
							paddingHorizontal: 0,
						}}
					>
						<Flex
							direction="row"
							justify="space-between"
							style={{ width: "100%" }}
						>
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								mr="sm"
								flex={1}
							>
								{position.title}
							</Text>
							<Flex direction="row" gap="xl">
								<Text>{position.soll_amount.toFixed(2)}€</Text>
								{istActive && (
									<Text c="gray.5">
										{getPositionIstAmount(
											position,
											receipts,
											receiptActive
										).toFixed(2)}
										€
									</Text>
								)}
							</Flex>
						</Flex>
					</Button>
				</Box>
			))}
		</Card>
	);

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: "white" }}
			refreshControl={
				<RefreshControl
					refreshing={budgetQuery.isRefetching || receiptsQuery.isRefetching}
					onRefresh={() => {
						budgetQuery.refetch();
						if (receiptActive) receiptsQuery.refetch();
					}}
				/>
			}
		>
			<Flex gap="md" p="sm" direction="column">
				<Card
					variant="filled"
					color="primary.1"
					radius={0}
					p="md"
					mb="sm"
					mt="lg"
				>
					<Text fs="md" fw="bold" c="gray.8">
						Zusammenfassung
					</Text>
				</Card>

				<Card variant="outline" radius="xs" p="sm" color="gray.2">
					<Flex direction="column" gap="sm">
						<Flex direction="row" justify="space-between">
							<Text>Einnahmen (Soll):</Text>
							<Text fw="500">{totalIncome.toFixed(2)}€</Text>
						</Flex>
						{istActive && (
							<Flex direction="row" justify="space-between">
								<Text>Einnahmen (Ist):</Text>
								<Text fw="500">{totalActualIncome.toFixed(2)}€</Text>
							</Flex>
						)}
						<Flex direction="row" justify="space-between">
							<Text>Ausgaben (Soll):</Text>
							<Text fw="500">{totalExpenses.toFixed(2)}€</Text>
						</Flex>
						{istActive && (
							<Flex direction="row" justify="space-between">
								<Text>Ausgaben (Ist):</Text>
								<Text fw="500">{totalActualExpenses.toFixed(2)}€</Text>
							</Flex>
						)}
						<Divider my="sm" color="gray.2" />
						<Flex direction="row" justify="space-between">
							<Text fw="600">Ergebnis (Soll):</Text>
							<Text fw="600">{(totalIncome - totalExpenses).toFixed(2)}€</Text>
						</Flex>
						{istActive && (
							<Flex direction="row" justify="space-between">
								<Text fw="600">Ergebnis (Ist):</Text>
								<Text fw="600">
									{(totalActualIncome - totalActualExpenses).toFixed(2)}€
								</Text>
							</Flex>
						)}
					</Flex>
				</Card>

				<Card
					variant="filled"
					color="green.1"
					radius={0}
					p="md"
					mb="sm"
					mt="lg"
				>
					<Flex direction="row" align="center" justify="space-between">
						<Text fs="md" fw="bold" c="gray.8">
							Einnahmen
						</Text>
						<Button
							variant="subtle"
							size="sm"
							onPress={() => {
								router.navigate(
									`/budgets/${budgetId}/position/newGroup?type=income` as RelativePathString
								);
							}}
						>
							<IconPlus size={16} color={applyColor("gray.6")} />
						</Button>
					</Flex>
				</Card>
				{sortedIncomeGroups.map(renderGroup)}

				<Card
					variant="filled"
					color="red.1"
					radius={0}
					p="md"
					mb="sm"
					mt="lg"
				>
					<Flex direction="row" align="center" justify="space-between">
						<Text fs="md" fw="bold" c="gray.8">
							Ausgaben
						</Text>
						<Button
							variant="subtle"
							size="sm"
							onPress={() => {
								router.navigate(
									`/budgets/${budgetId}/position/newGroup?type=expense` as RelativePathString
								);
							}}
						>
							<IconPlus size={16} color={applyColor("gray.6")} />
						</Button>
					</Flex>
				</Card>
				{sortedExpenseGroups.map(renderGroup)}

				{receiptActive && (
					<>
						<Card
							variant="filled"
							color="primary.1"
							radius={0}
							p="md"
							mb="sm"
							mt="lg"
						>
							<Flex
								direction="row"
								align="center"
								justify="space-between"
							>
								<Text fs="md" fw="bold" c="gray.8">
									Belege
								</Text>
								<Button
									variant="subtle"
									size="sm"
									onPress={() => {
										router.navigate(
											`/budgets/${budgetId}/receipts/new` as RelativePathString
										);
									}}
								>
									<IconPlus size={16} color={applyColor("gray.6")} />
								</Button>
							</Flex>
						</Card>
						<Card variant="outline" radius="xs" p="sm" color="gray.2">
							<Flex direction="column" gap="sm">
								<Text>
									{(receiptsQuery.data || []).length} Beleg
									{(receiptsQuery.data || []).length === 1 ? "" : "e"}
								</Text>
								<Button
									variant="outline"
									size="sm"
									onPress={() => {
										router.navigate(
											`/budgets/${budgetId}/receipts` as RelativePathString
										);
									}}
								>
									Belege anzeigen
								</Button>
							</Flex>
						</Card>
					</>
				)}
			</Flex>
		</ScrollView>
	);
};
