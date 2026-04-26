import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import { ScrollView, RefreshControl, Alert } from "react-native";
import SVHLoader from "@/components/common/SVHLoader";
import { deleteBudget, getBudget } from "@/api/Budget";
import { BudgetPosition, BudgetPositionType } from "@/api/Budget";
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

export default () => {
	const { budgetId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const budgetQuery = useQuery({
		queryKey: ["budget", budgetId],
		queryFn: () => getBudget({ tenantId: currentTenant!._id, budgetId: budgetId as string }),
	});

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
		return <SVHLoader />;
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

	// Group positions by type and parent
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

	// Calculate totals
	const totalIncome = incomeGroups.reduce(
		(sum, group) => sum + group.positions.reduce((sum, position) => sum + position.soll_amount, 0),
		0
	);

	const totalExpenses = expenseGroups.reduce(
		(sum, group) => sum + group.positions.reduce((sum, position) => sum + position.soll_amount, 0),
		0
	);

	const totalActualIncome = incomeGroups.reduce(
		(sum, group) => sum + group.positions.reduce((sum, position) => sum + (position.ist_amount || 0), 0),
		0
	);

	const totalActualExpenses = expenseGroups.reduce(
		(sum, group) => sum + group.positions.reduce((sum, position) => sum + (position.ist_amount || 0), 0),
		0
	);

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: "white" }}
			refreshControl={
				<RefreshControl
					refreshing={budgetQuery.isRefetching}
					onRefresh={budgetQuery.refetch}
				/>
			}
		>
			<Flex
				gap="md"
				p="sm"
				direction="column"
			>
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
						<Flex
							direction="row"
							align="center"
							gap="sm"
						>
							<Text
								fs="md"
								fw="bold"
								c="gray.8"
							>
								Zusammenfassung
							</Text>
						</Flex>
					</Flex>
				</Card>

				<Card
					variant="outline"
					radius="xs"
					p="sm"
					color="gray.2"
				>
					<Flex
						direction="column"
						gap="sm"
					>
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text>Einnahmen (Soll):</Text>
							<Text fw="500">{totalIncome.toFixed(2)}€</Text>
						</Flex>
						{budgetQuery.data.budget.ist_active && (
							<Flex
								direction="row"
								justify="space-between"
							>
								<Text>Einnahmen (Ist):</Text>
								<Text fw="500">{totalActualIncome.toFixed(2)}€</Text>
							</Flex>
						)}
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text>Ausgaben (Soll):</Text>
							<Text fw="500">{totalExpenses.toFixed(2)}€</Text>
						</Flex>
						{budgetQuery.data.budget.ist_active && (
							<Flex
								direction="row"
								justify="space-between"
							>
								<Text>Ausgaben (Ist):</Text>
								<Text fw="500">{totalActualExpenses.toFixed(2)}€</Text>
							</Flex>
						)}
						<Divider
							my="sm"
							color="gray.2"
						/>
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text fw="600">Ergebnis (Soll):</Text>
							<Text fw="600">{totalIncome - totalExpenses}€</Text>
						</Flex>
						{budgetQuery.data.budget.ist_active && (
							<Flex
								direction="row"
								justify="space-between"
							>
								<Text fw="600">Ergebnis (Ist):</Text>
								<Text fw="600">
									{totalActualIncome - totalActualExpenses}€
								</Text>
							</Flex>
						)}
					</Flex>
				</Card>

				{/* Income Groups */}
				<Card
					variant="filled"
					color="green.1"
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
						<Flex
							direction="row"
							align="center"
							gap="sm"
						>
							<Text
								fs="md"
								fw="bold"
								c="gray.8"
							>
								Einnahmen
							</Text>
						</Flex>
						<Button
							variant="subtle"
							size="sm"
							onPress={() => {
								router.navigate(
									`/budgets/${budgetId}/position/newGroup?type=income` as RelativePathString
								);
							}}
						>
							<IconPlus
								size={16}
								color={applyColor("gray.6")}
							/>
						</Button>
					</Flex>
				</Card>
				{incomeGroups.map((group) => (
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
								style={{ flex: 1, justifyContent: 'flex-start' }}
                                pl={0}  
							>
								<Text
									fw="600"
								>
									{group.group.title}
								</Text>
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
								<IconPlus
									size={16}
									color={applyColor("gray.6")}
								/>
							</Button>
						</Flex>
						<Flex
							direction="row"
							justify="space-between"
							mb="sm"
							pr="sm"
						>
							<Text c="gray.5">Position</Text>
							<Flex
								direction="row"
								gap="xl"
							>
								<Text
									c="gray.5"
									mr="md"
								>
									Soll
								</Text>
								{budgetQuery.data.budget.ist_active && (
									<Text c="gray.5">Ist</Text>
								)}
							</Flex>
						</Flex>
						<Divider
							my="sm"
							color="gray.2"
						/>
						{group.positions.map((position) => (
							<Box
								key={position._id}
								mb="xs"
							>
								<Button
									variant="subtle"
									size="sm"
									onPress={() => {
										router.navigate(
											`/budgets/${budgetId}/position/${position._id}/edit` as RelativePathString
										);
									}}
									style={{ width: '100%', justifyContent: 'space-between', paddingHorizontal: 0 }}
								>
									<Flex
										direction="row"
										justify="space-between"
										style={{ width: '100%' }}
									>
										<Text
											className="flex-1 mr-4"
											numberOfLines={1}
											ellipsizeMode="tail"
											mr="sm"
											flex={1}
										>
											{position.title}
										</Text>
										<Flex
											direction="row"
											gap="xl"
										>
											<Text>
												{position.soll_amount.toFixed(
													2
												)}
												€
											</Text>
											{budgetQuery.data.budget.ist_active && (
												<Text className="text-gray-500">
													{position.ist_amount?.toFixed(
														2
													) || "0.00"}
													€
												</Text>
											)}
										</Flex>
									</Flex>
								</Button>
							</Box>
						))}
					</Card>
				))}

				{/* Expense Groups */}
				<Card
					variant="filled"
					color="red.1"
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
						<Flex
							direction="row"
							align="center"
							gap="sm"
						>
							<Text
								fs="md"
								fw="bold"
								c="gray.8"
							>
								Ausgaben
							</Text>
						</Flex>
						<Button
							variant="subtle"
							size="sm"
							onPress={() => {
								router.navigate(
									`/budgets/${budgetId}/position/newGroup?type=expense` as RelativePathString
								);
							}}
						>
							<IconPlus
								size={16}
								color={applyColor("gray.6")}
							/>
						</Button>
					</Flex>
				</Card>
				{expenseGroups.map((group) => (
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
								style={{ flex: 1, justifyContent: 'flex-start' }}
                                pl={0}
							>
								<Text
									fw="600"
								>
									{group.group.title}
								</Text>
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
								<IconPlus
									size={16}
									color={applyColor("gray.6")}
								/>
							</Button>
						</Flex>
						<Flex
							direction="row"
							justify="space-between"
							mb="sm"
							pr="sm"
						>
							<Text
								c="gray.5"
								mr="md"
							>
								Position
							</Text>
							<Flex
								direction="row"
								gap="xl"
							>
								<Text c="gray.5">Soll</Text>
								{budgetQuery.data.budget.ist_active && (
									<Text c="gray.5">Ist</Text>
								)}
							</Flex>
						</Flex>
						<Divider
							my="sm"
							color="gray.2"
						/>
						{group.positions.map((position) => (
							<Box
								key={position._id}
								mb="xs"
							>
								<Button
									variant="subtle"
									size="sm"
									onPress={() => {
										router.navigate(
											`/budgets/${budgetId}/position/${position._id}/edit` as RelativePathString
										);
									}}
									style={{ width: '100%', justifyContent: 'space-between', paddingHorizontal: 0 }}
								>
									<Flex
										direction="row"
										justify="space-between"
										style={{ width: '100%' }}
									>
										<Text
											className="flex-1 mr-4"
											numberOfLines={1}
											ellipsizeMode="tail"
											mr="sm"
											flex={1}
										>
											{position.title}
										</Text>
										<Flex
											direction="row"
											gap="xl"
										>
											<Text>
												{position.soll_amount.toFixed(
													2
												)}
												€
											</Text>
											{budgetQuery.data.budget.ist_active && (
												<Text className="text-gray-500">
													{position.ist_amount?.toFixed(
														2
													) || "0.00"}
													€
												</Text>
											)}
										</Flex>
									</Flex>
								</Button>
							</Box>
						))}
					</Card>
				))}
			</Flex>
		</ScrollView>
	);
};
