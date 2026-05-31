import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, TouchableOpacity, RefreshControl } from "react-native";
import { applyColor, Avatar, Box, Button, Card, FAB, Flex, Text } from "@eduinteractive/balladui";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Project, ProjectTask, deleteProject, getProject, updateProject } from "@/api/Project";
import { useTenant } from "@/context/TenantContext";
import UVCLoader from "@/components/common/UVCLoader";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { NotificationHandler } from "@/utils/NotificationHandler";
import useTenantMembers from "@/hooks/useTenantMembers";
import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

interface TaskWithColumn extends ProjectTask {
	columnId: string;
	columnTitle: string;
	isHeader?: boolean;
}

interface ColumnHeader {
	_id: string;
	columnId: string;
	columnTitle: string;
	taskCount: number;
	isHeader: true;
}

type ListItem = TaskWithColumn | ColumnHeader;

export default () => {
	const { projectId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const [project, setProject] = useState<Project | null>(null);
	const [flattenedData, setFlattenedData] = useState<ListItem[]>([]);
	const navigation = useNavigation();
	const queryClient = useQueryClient();
	const tenantMembers = useTenantMembers();

	const { data, isLoading } = useQuery({
		queryKey: ["project", currentTenant?._id, projectId],
		queryFn: () =>
			getProject({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
			}),
	});

	const updateTaskOrderMutation = useMutation({
		mutationFn: updateProject,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project", currentTenant?._id, projectId],
			});
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du dieses Projekt wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteProject({
							tenantId: currentTenant!._id,
							projectId: projectId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["projects", currentTenant?._id, {}],
						});
					} catch (error) {
						Alert.alert("Fehler", "Das Projekt konnte nicht gelöscht werden.");
					} finally {
						router.back();
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (data) {
			navigation.setOptions({
				title: data.title,
				headerRight: () =><HeaderMenu
                    options={[
                        { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                        { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                    ]}
                    onSelect={(value) => {
                        if (value === "edit") router.push(`/projects/${projectId}/edit`);
                        if (value === "delete") handleDelete();
                    }}
                />
			});
		}
	}, [data, navigation]);

	useEffect(() => {
		if (data) {
			setProject(data);
			// Flatten all tasks with column information and add headers
			const flattened: ListItem[] = [];
			data.columns.forEach((column) => {
				// Add column header
				flattened.push({
					_id: `header-${column._id}`,
					columnId: column._id,
					columnTitle: column.title,
					taskCount: column.tasks.length,
					isHeader: true,
				});
				// Add tasks with column info
				column.tasks.forEach((task) => {
					flattened.push({
						...task,
						columnId: column._id,
						columnTitle: column.title,
					});
				});
			});
			setFlattenedData(flattened);
		}
	}, [data]);

	const renderItem = ({ item, drag, isActive }: RenderItemParams<ListItem>) => {
		// Render column header
		if ("isHeader" in item) {
			const header = item as ColumnHeader;
			return (
				<Card
					variant="filled"
					color="primary.1"
					radius={0}
					p="md"
					mx="md"
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
								{header.columnTitle}
							</Text>
							<Text
								fs="xs"
								c="gray.6"
							>
								({header.taskCount} Aufgaben)
							</Text>
						</Flex>
						<Button
							variant="subtle"
							size="sm"
							onPress={() => {
								router.navigate(
									`/projects/${projectId}/columns/${header.columnId}/newTask` as RelativePathString
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
			);
		}

		// Render task item
		const task = item as TaskWithColumn;
		return (
			<TouchableOpacity
				onLongPress={drag}
				disabled={isActive}
				onPress={() => {
					router.navigate(
						`/projects/${projectId}/tasks/${task._id}` as RelativePathString
					);
				}}
			>
				<Card
					variant="filled"
					color={isActive ? "gray.1" : "white"}
					radius={0}
					p="md"
					mx="md"
					mb="sm"
					style={{
						borderLeftColor: task.color || undefined,
						borderLeftWidth: task.color ? 4 : 0,
					}}
				>
					<Flex
						direction="row"
						align="center"
						gap="sm"
						justify="space-between"
					>
						<Flex
							direction="row"
							align="center"
							gap="sm"
						>
							<IconDotsVertical
								size={20}
								color={applyColor("gray.5")}
							/>
							<Flex
								direction="column"
								flex={0.9}
							>
								<Text fs="smd">{task.title}</Text>
								{task.dueDate && (
									<Text
										fs="xs"
										c="red"
										mt="xs"
									>
										Fällig:{" "}
										{new Date(
											task.dueDate
										).toLocaleDateString()}
									</Text>
								)}
							</Flex>
						</Flex>
						{task.owner && (
							<Avatar size="sm">
								{(() => {
									const member = tenantMembers.find(
										(member) => member._id === task.owner
									);
									return member
										? `${member.firstName.substring(
												0,
												1
										  )}${member.lastName.substring(0, 1)}`
										: "";
								})()}
							</Avatar>
						)}
					</Flex>
				</Card>
			</TouchableOpacity>
		);
	};

	const handleDragEnd = ({ data, from, to }: { data: ListItem[]; from: number; to: number }) => {
		if (!project) return;

		// Filter out headers to get only tasks
		const tasks = data.filter((item): item is TaskWithColumn => !("isHeader" in item));

		// Find the moved task
		const movedTask = tasks.find(
			(task) =>
				flattenedData[from] &&
				!("isHeader" in flattenedData[from]) &&
				(flattenedData[from] as TaskWithColumn)._id === task._id
		);

		if (!movedTask) return;

		// Determine target column by looking at the position in the flattened array
		let targetColumnId = movedTask.columnId;
		let targetIndex = to;

		// Find the closest header before the target position to determine target column
		for (let i = to; i >= 0; i--) {
			const item = data[i];
			if ("isHeader" in item) {
				targetColumnId = item.columnId;
				break;
			}
		}

		// Build new column structure
		const updatedColumns = project.columns.map((column) => {
			const columnTasks = tasks.filter((task) => task.columnId === column._id);

			if (column._id === targetColumnId) {
				// This is the target column, insert the moved task at the right position
				const otherTasks = columnTasks.filter((task) => task._id !== movedTask._id);

				// Find the position within this column
				const headerIndex = data.findIndex(
					(item) => "isHeader" in item && item.columnId === targetColumnId
				);
				const tasksAfterHeader = data.slice(headerIndex + 1);
				const positionInColumn = tasksAfterHeader.findIndex(
					(item) => "isHeader" in item || (item as TaskWithColumn)._id === movedTask._id
				);

				if (positionInColumn === -1) {
					// Add at the end
					otherTasks.push(movedTask);
				} else {
					// Insert at the specific position
					otherTasks.splice(Math.max(0, positionInColumn), 0, movedTask);
				}

				return {
					...column,
					tasks: otherTasks.map((task) => task._id),
				};
			} else {
				// Remove the moved task from other columns
				return {
					...column,
					tasks: columnTasks
						.filter((task) => task._id !== movedTask._id)
						.map((task) => task._id),
				};
			}
		});

		setFlattenedData(data);
		updateTaskOrderMutation.mutate({
			tenantId: currentTenant!._id,
			projectId: projectId as string,
			body: {
				columns: updatedColumns,
			},
		});
	};

	if (isLoading) {
		return <UVCLoader />;
	}

	return (
		<Box flex={1}>
			<DraggableFlatList
				data={flattenedData}
				renderItem={renderItem}
				keyExtractor={(item) => item._id}
				onDragEnd={handleDragEnd}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={() => {
							queryClient.invalidateQueries({
								queryKey: ["project", currentTenant?._id, projectId],
							});
						}}
					/>
				}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: 100,
				}}
			/>

			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() =>
					router.navigate(`/projects/${projectId}/columns/new` as RelativePathString)
				}
			>
				<Flex
					direction="row"
					align="center"
					gap="sm"
				>
					<IconPlus
						size={18}
						color="white"
					/>
					<Text
						fs="sm"
						fw="bold"
						c="white"
					>
						Neue Spalte
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
