import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Alert, TouchableOpacity } from "react-native";
import { applyColor, applyFontSizeProp, Avatar, Box, Button, Card, Flex, Space, Text } from "@eduinteractive/balladui";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getTask, deleteTask, ProjectConnector } from "@/api/Project";
import { useTenant } from "@/context/TenantContext";
import SVHLoader from "@/components/common/SVHLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import Markdown from "react-native-markdown-display";
import { htmlToMarkdown } from "@/utils/Parser";
import useTenantMembers from "@/hooks/useTenantMembers";
import useBudgets from "@/hooks/useBudgets";
import useWikis from "@/hooks/useWikis";
import useEvents from "@/hooks/useEvents";
import useSurveys from "@/hooks/useSurveys";
import SVHMaterials from "@/components/common/SVHMaterials";
import { IconCircle, IconCircleCheck, IconEdit, IconExternalLink, IconLink, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { projectId, taskId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const navigation = useNavigation();
	const queryClient = useQueryClient();
	const tenantMembers = useTenantMembers();
    
	const { data: task, isLoading } = useQuery({
		queryKey: ["task", currentTenant?._id, projectId, taskId],
		queryFn: () =>
			getTask({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
				taskId: taskId as string,
			}),
		enabled: !!projectId && !!taskId && !!currentTenant,
	});

	// Data fetching for connectors
	const budgets = useBudgets();
	const wikis = useWikis();
	const events = useEvents();
	const surveys = useSurveys();

	const deleteTaskMutation = useMutation({
		mutationFn: deleteTask,
		onSuccess: () => {
			NotificationHandler.showSuccess("Aufgabe wurde erfolgreich gelöscht");
			queryClient.invalidateQueries({
				queryKey: ["project", currentTenant?._id, projectId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diese Aufgabe wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteTaskMutation.mutateAsync({
							tenantId: currentTenant!._id,
							projectId: projectId as string,
							taskId: taskId as string,
						});
					} catch (error) {
						Alert.alert("Fehler", "Die Aufgabe konnte nicht gelöscht werden.");
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (task) {
			navigation.setOptions({
				title: task.title,
				headerRight: () =><HeaderMenu
                    options={[
                        { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                        { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                    ]}
                    onSelect={(value) => {
                        if (value === "edit") router.push(`/projects/${projectId}/tasks/${taskId}/edit`);
                        if (value === "delete") handleDelete();
                    }}
                />
            });
		}
	}, [task, navigation]);

	if (isLoading) {
		return <SVHLoader />;
	}

	if (!task) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text>Aufgabe nicht gefunden</Text>
			</Flex>
		);
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: "white" }}>
			{/* Task Information */}
			<Card
				variant="outline"
				color="gray.3"
				radius={0}
				style={{
					borderTopWidth: 0.25,
					borderBottomWidth: 0.25,
				}}
			>
				<Text
					fs="lg"
					fw="bold"
					mb="md"
					c="gray.8"
				>
					Aufgabendetails
				</Text>

				{/* Title */}
				<Box mb="md">
					<Text
						fs="xs"
						fw="bold"
						c="gray.4"
					>
						Titel
					</Text>
					<Text fs="sm">{task.title}</Text>
				</Box>

				{/* Description */}
				{task.description && (
					<Box mb="md">
						<Text
							fs="xs"
							fw="bold"
							c="gray.4"
						>
							Beschreibung
						</Text>
						<Markdown>{htmlToMarkdown(task.description)}</Markdown>
					</Box>
				)}

				{/* Due Date */}
				{task.dueDate && (
					<Box mb="md">
						<Text
							fs="xs"
							fw="bold"
							c="gray.4"
						>
							Fälligkeitsdatum
						</Text>
						<Text fs="sm">{new Date(task.dueDate).toLocaleDateString()}</Text>
					</Box>
				)}

				<Space h={20} />

				<Flex
					direction="column"
					gap="xs"
					justify="flex-end"
					align="flex-end"
				>
					<Text
						fs="xs"
						c="gray.4"
					>
						Erstellt am {new Date(task.createdAt).toLocaleDateString()} um{" "}
						{new Date(task.createdAt).toLocaleTimeString()}
					</Text>
					<Text
						fs="xs"
						c="gray.4"
					>
						Zuletzt bearbeitet am {new Date(task.updatedAt).toLocaleDateString()} um{" "}
						{new Date(task.updatedAt).toLocaleTimeString()}
					</Text>
				</Flex>
			</Card>

			{/* Subtasks */}
			{task.subtasks && task.subtasks.length > 0 && (
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
				>
					<Text
						fs="lg"
						fw="bold"
						mb="md"
						c="gray.8"
					>
						Unteraufgaben ({task.subtasks.length})
					</Text>
					{task.subtasks.map((subtask, index) => (
						<Card
							key={subtask._id || index}
							variant="outline"
							p="md"
							mb="sm"
							style={{ borderColor: "#e0e0e0" }}
						>
							<Flex
								direction="row"
								justify="space-between"
								align="center"
							>
								<Flex
									direction="row"
									align="center"
									gap="md"
									flex={0.9}
								>
                                    {subtask.done && (
                                        <IconCircleCheck
                                            size={20}
                                            color={applyColor("green")}
                                        />
                                    )}
                                    {!subtask.done && (
                                        <IconCircle
                                            size={20}
                                            color={applyColor("gray.5")}
                                        />
                                    )}
									<Box flex={1}>
										<Text
											fs="md"
											c={
												subtask.done
													? "gray.6"
													: "gray.8"
											}
											style={{
												textDecorationLine:
													subtask.done
														? "line-through"
														: "none",
											}}
										>
											{subtask.title}
										</Text>
										{subtask.description && (
											<Markdown
												style={{
													paragraph: {
														fontSize: applyFontSizeProp(
															"xs"
														),
														marginTop: 0,
														paddingTop: 0,
													},
												}}
											>
												{htmlToMarkdown(
													subtask.description
												)}
											</Markdown>
										)}
										{subtask.dueDate && (
											<Text
												fs="xs"
												c="red"
											>
												Fällig:{" "}
												{new Date(
													subtask.dueDate
												).toLocaleDateString()}
											</Text>
										)}
									</Box>
								</Flex>
								{subtask.owner && (
									<Avatar size="sm">
										{(() => {
											const member =
												tenantMembers.find(
													(member) =>
														member._id ===
														subtask.owner
												);
											return member
												? `${member.firstName.substring(
														0,
														1
												  )}${member.lastName.substring(
														0,
														1
												  )}`
												: "";
										})()}
									</Avatar>
								)}
							</Flex>
						</Card>
					))}
				</Card>
			)}

			{/* Materials */}
			{task.materials && task.materials.length > 0 && (
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
				>
					<Text
						fs="lg"
						fw="bold"
						mb="md"
						c="gray.8"
					>
						Materialien ({task.materials.length})
					</Text>
					<SVHMaterials materials={task.materials} />
				</Card>
			)}

			{/* Connectors */}
			{task.connectors && task.connectors.length > 0 && (
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
				>
					<Text
						fs="lg"
						fw="bold"
						mb="md"
						c="gray.8"
					>
						Verknüpfungen ({task.connectors.length})
					</Text>
					{task.connectors.map((connector, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => {
								switch (connector.origin) {
									case ProjectConnector.BUDGET:
										router.replace(
											`/budgets/${connector.target}` as RelativePathString
										);
										break;
									case ProjectConnector.WIKI:
										router.replace(
											`/knowledge/wiki/${connector.target.replace(
												":",
												"/section/"
											)}` as RelativePathString
										);
										break;
									case ProjectConnector.EVENT:
										router.replace(
											`/events/${connector.target}` as RelativePathString
										);
										break;
									case ProjectConnector.SURVEY:
										router.replace(
											`/survey/${connector.target}` as RelativePathString
										);
										break;
								}
							}}
						>
							<Card
								variant="outline"
								p="md"
								mb="sm"
								style={{ borderColor: "#e0e0e0" }}
							>
								<Flex
									direction="row"
									align="center"
									gap="sm"
								>
									<IconLink
										size={20}
										color={applyColor("primary")}
									/>
									<Box flex={1}>
										<Text
											fs="md"
											c="primary"
										>
											{connector.origin}
										</Text>
										<Text
											fs="sm"
											c="gray.6"
										>
											{(() => {
												switch (
													connector.origin
												) {
													case ProjectConnector.BUDGET:
														return budgets.find(
															(
																budget
															) =>
																budget._id ===
																connector.target
														)
															?.title;
													case ProjectConnector.WIKI:
														return wikis.find(
															(
																wiki
															) =>
																wiki._id ===
																connector.target.split(
																	":"
																)[0]
														)
															?.title;
													case ProjectConnector.EVENT:
														return events.find(
															(
																event
															) =>
																event._id ===
																connector.target
														)
															?.title;
													case ProjectConnector.SURVEY:
														return surveys.find(
															(
																survey
															) =>
																survey._id ===
																connector.target
														)
															?.title;
												}
											})()}
										</Text>
									</Box>
									<IconExternalLink
										size={16}
										color={applyColor("gray.5")}
									/>
								</Flex>
							</Card>
						</TouchableOpacity>
					))}
				</Card>
			)}
		</ScrollView>
	);
};
