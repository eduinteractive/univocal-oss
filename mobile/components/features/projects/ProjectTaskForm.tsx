import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard } from "react-native";
import { Button, Card, Flex, Select, Text, TextInput } from "@eduinteractive/balladui";
import { applyColor } from "@eduinteractive/balladui";
import { ProjectSubtask } from "@/api/Project";
import { Budget } from "@/api/Budget";
import { Wiki } from "@/api/Wiki";
import { SurveyMeta } from "@/api/Survey";
import { TenantUser } from "@/api/Tenant";
import { htmlToMarkdown } from "@/utils/Parser";
import { UVCEvent } from "@/api/Events";
import UVCMaterialForm, { Material } from "@/components/common/UVCMaterialForm";
import { IconCircleCheck, IconCircle, IconPlus, IconTrash } from "@/assets/icons/Icon";

export interface ProjectTaskFormData {
	title: string;
	description?: string;
	color?: string;
	dueDate?: Date | string;
	owner?: string;
	subtasks?: ProjectSubtask[];
	connectors?: {
		origin: string;
		target: string;
	}[];
	materials?: {
		title: string;
		link: string;
		mimetype: string;
	}[];
	newUploads?: File[];
}

interface ProjectTaskFormProps {
	data?: ProjectTaskFormData | null;
	budgets: Budget[];
	wikis: Wiki[];
	events: UVCEvent[];
	surveys: SurveyMeta[];
	tenantMembers: TenantUser[];
	loading?: boolean;
	onSubmit: (data: ProjectTaskFormData) => void;
	submitButtonText?: string;
}

const ProjectTaskForm = (props: ProjectTaskFormProps) => {
	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [color, setColor] = useState<string>("");
	const [dueDate, setDueDate] = useState<string>("");
	const [owner, setOwner] = useState<string>("");
	const [subtasks, setSubtasks] = useState<ProjectSubtask[]>([]);
	const [connectors, setConnectors] = useState<{ origin: string; target: string }[]>([]);
	const [materials, setMaterials] = useState<Material[]>([]);
	const [newUploads, setNewUploads] = useState<File[]>([]);

	useEffect(() => {
		if (props.data) {
			const task = props.data;
			setTitle(task.title);
			setDescription(htmlToMarkdown(task.description || "", true));
			setColor(task.color || "");
			setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
			setOwner(task.owner || "");
			setSubtasks(
				task.subtasks?.map((subtask) => ({
					...subtask,
					description: htmlToMarkdown(subtask.description || "", true),
				})) || []
			);
			setConnectors(task.connectors || []);
			setMaterials(task.materials || []);
			setNewUploads(task.newUploads || []);
		} else {
			setTitle("");
			setDescription("");
			setColor("");
			setDueDate("");
			setOwner("");
			setSubtasks([]);
			setConnectors([]);
			setMaterials([]);
			setNewUploads([]);
		}
	}, [props.data]);

	const handleSubmit = async () => {
		if (!title.trim()) {
			return;
		}

		props.onSubmit({
			title: title.trim(),
			description: description.trim() || "",
			color: color || "",
			dueDate: dueDate ? new Date(dueDate) : "",
			owner: owner || "",
			subtasks: subtasks,
			connectors: connectors,
			materials: materials,
			newUploads: newUploads,
		});
	};

	const addSubtask = () => {
		const newSubtask: ProjectSubtask = {
			_id: "",
			title: "",
			description: "",
			dueDate: undefined,
			done: false,
		};
		setSubtasks([...subtasks, newSubtask]);
	};

	const updateSubtask = (index: number, field: keyof ProjectSubtask, value: any) => {
		const updated = [...subtasks];
		updated[index] = { ...updated[index], [field]: value };
		setSubtasks(updated);
	};

	const removeSubtask = (index: number) => {
		setSubtasks(subtasks.filter((_, i) => i !== index));
	};

	const addConnector = () => {
		const newConnector: { origin: string; target: string } = {
			origin: "",
			target: "",
		};
		setConnectors([...connectors, newConnector]);
	};

	const updateConnector = (index: number, field: keyof { origin: string; target: string }, value: string) => {
		const updated = [...connectors];

		// If changing origin, reset target
		if (field === "origin") {
			updated[index] = { origin: value, target: "" };
		} else {
			updated[index] = { ...updated[index], [field]: value };
		}

		setConnectors(updated);
	};

	const removeConnector = (index: number) => {
		setConnectors(connectors.filter((_, i) => i !== index));
	};

	const colorOptions = [
		{ label: "Blau", value: "#228be6" },
		{ label: "Rot", value: "#e64980" },
		{ label: "Lila", value: "#be4bdb" },
		{ label: "Violett", value: "#7950f2" },
		{ label: "Türkis", value: "#12b886" },
		{ label: "Grün", value: "#40c057" },
		{ label: "Gelb", value: "#fab005" },
		{ label: "Orange", value: "#fd7e14" },
	];

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, flexGrow: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 250, backgroundColor: "white" }}
			>
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
					p="md"
				>
					<Flex
						direction="column"
						gap="md"
					>
						<Text
							fs="lg"
							fw="bold"
							mb="sm"
							c="gray.8"
						>
							Aufgabendetails
						</Text>

						<TextInput
							size="sm"
							label="Titel"
							placeholder="Titel eingeben..."
							value={title}
							onChangeText={setTitle}
							onSubmitEditing={() => Keyboard.dismiss()}
							required
						/>

						<TextInput
							size="sm"
							label="Beschreibung"
							placeholder="Beschreibung eingeben..."
							value={description}
							onChangeText={setDescription}
							onSubmitEditing={() => Keyboard.dismiss()}
							multiline
							numberOfLines={4}
						/>

						<TextInput
							size="sm"
							label="Fälligkeitsdatum"
							placeholder="YYYY-MM-DD"
							value={dueDate}
							onChangeText={setDueDate}
							onSubmitEditing={() => Keyboard.dismiss()}
						/>

						{/* Owner Selection */}
						<Select
							size="sm"
							label="Verantwortliche Person"
							placeholder="Person auswählen..."
							options={props.tenantMembers.map((member) => ({
								label: `${member.firstName} ${member.lastName}`,
								value: member._id,
							}))}
							value={owner}
							onChange={(value) => setOwner(value)}
						/>

						{/* Color Selection */}
						<Select
							color={color ?? undefined}
							size="sm"
							label="Farbe"
							placeholder="Farbe auswählen..."
							options={colorOptions.map((option) => ({
								label: option.label,
								value: option.value,
							}))}
							value={color}
							onChange={(value) => setColor(value)}
							renderOption={(option) => (
								<Text c={option.value}>{option.label}</Text>
							)}
						/>
					</Flex>
				</Card>

				{/* Subtasks */}
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
					p="md"
				>
					<Flex
						direction="row"
						align="center"
						justify="space-between"
						mb="sm"
					>
						<Text
							fs="lg"
							fw="bold"
							c="gray.8"
						>
							Unteraufgaben ({subtasks.length})
						</Text>
						<Button
							variant="subtle"
							onPress={addSubtask}
						>
							<IconPlus
								size={20}
								color={applyColor("blue")}
							/>
						</Button>
					</Flex>

					{subtasks.map((subtask, index) => (
						<Card
							key={index}
							variant="outline"
							p="md"
							mb="sm"
							style={{ borderColor: "#e0e0e0" }}
						>
							<Flex
								direction="column"
								gap="md"
							>
								<TextInput
									value={subtask.title}
									onChangeText={(value) =>
										updateSubtask(index, "title", value)
									}
									label="Titel der Unteraufgabe"
									placeholder="Titel eingeben..."
									size="sm"
								/>
								<TextInput
									value={subtask.description || ""}
									onChangeText={(value) =>
										updateSubtask(
											index,
											"description",
											value
										)
									}
									label="Beschreibung"
									placeholder="Beschreibung eingeben..."
									numberOfLines={4}
									multiline
									size="sm"
								/>
								<TextInput
									value={
										subtask.dueDate
											? new Date(subtask.dueDate)
													.toISOString()
													.split("T")[0]
											: ""
									}
									onChangeText={(value) =>
										updateSubtask(
											index,
											"dueDate",
											value
												? new Date(value)
												: undefined
										)
									}
									label="Fälligkeitsdatum"
									placeholder="YYYY-MM-DD"
									size="sm"
								/>

								{/* Subtask Owner Selection */}
								<Select
									size="sm"
									label="Verantwortliche Person"
									placeholder="Person auswählen..."
									options={props.tenantMembers.map((member) => ({
										label: `${member.firstName} ${member.lastName}`,
										value: member._id,
									}))}
									value={subtask.owner || ""}
									onChange={(value) =>
										updateSubtask(index, "owner", value)
									}
								/>

								<Flex
									direction="row"
									align="center"
									justify="space-between"
									gap="sm"
								>
									<Flex
										direction="row"
										align="center"
										gap="sm"
									>
										<TouchableOpacity
											onPress={() =>
												updateSubtask(
													index,
													"done",
													!subtask.done
												)
											}
										>
											{subtask.done ? (
												<IconCircleCheck
													size={20}
													color={applyColor(
														"green"
													)}
												/>
											) : (
												<IconCircle
													size={20}
													color={applyColor(
														"gray.5"
													)}
												/>
											)}
										</TouchableOpacity>
										<Text
											fs="sm"
											c="gray.5"
										>
											{subtask.done
												? "Fertig"
												: "In Arbeit"}
										</Text>
									</Flex>

									<TouchableOpacity
										onPress={() => removeSubtask(index)}
									>
										<IconTrash
											size={20}
											color={applyColor("red")}
										/>
									</TouchableOpacity>
								</Flex>
							</Flex>
						</Card>
					))}
				</Card>

				{/* Connectors */}
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
					p="md"
				>
					<Flex
						direction="row"
						align="center"
						justify="space-between"
						mb="sm"
					>
						<Text
							fs="lg"
							fw="bold"
							c="gray.8"
						>
							Verknüpfungen ({connectors.length})
						</Text>
						<Button
							variant="subtle"
							onPress={addConnector}
						>
							<IconPlus
								size={20}
								color={applyColor("blue")}
							/>
						</Button>
					</Flex>

					{connectors.map((connector, index) => (
						<Card
							key={index}
							variant="outline"
							p="md"
							mb="sm"
							style={{ borderColor: "#e0e0e0" }}
						>
							<Flex
								direction="column"
								gap="md"
							>
								<Select
									size="sm"
									label="Typ der Verknüpfung"
									placeholder="Typ auswählen..."
									options={[
										{ label: "Budget", value: "BUDGET" },
										{
											label: "Wiki-Kapitel",
											value: "WIKI",
										},
										{ label: "Event", value: "EVENT" },
										{ label: "Umfrage", value: "SURVEY" },
									]}
									value={connector.origin}
									onChange={(value) =>
										updateConnector(index, "origin", value)
									}
								/>

								{connector.origin === "BUDGET" && (
									<Select
										size="sm"
										label="Budget auswählen"
										placeholder="Budget auswählen..."
										options={props.budgets.map(
											(budget) => ({
												label: budget.title,
												value: budget._id,
											})
										)}
										value={connector.target}
										onChange={(value) =>
											updateConnector(
												index,
												"target",
												value
											)
										}
									/>
								)}

								{connector.origin === "WIKI" && (
									<>
										<Select
											size="sm"
											label="Wiki auswählen"
											placeholder="Wiki auswählen..."
											options={props.wikis.map(
												(wiki) => ({
													label: wiki.title,
													value: wiki._id,
												})
											)}
											value={
												connector.target &&
												!connector.target.includes(
													":"
												)
													? connector.target
													: connector.target.split(
															":"
													  )[0]
											}
											onChange={(value) =>
												updateConnector(
													index,
													"target",
													value
												)
											}
										/>

										{connector.target && (
											<Select
												size="sm"
												label="Wiki-Kapitel auswählen"
												placeholder="Kapitel auswählen..."
												options={
													props.wikis
														.find(
															(
																w
															) =>
																w._id ===
																connector.target.split(
																	":"
																)[0]
														)
														?.tableOfContents.map(
															(
																toc
															) => ({
																label: toc.title,
																value:
																	connector.target.split(
																		":"
																	)[0] +
																	":" +
																	toc.sectionId,
															})
														) || []
												}
												value={connector.target}
												onChange={(value) =>
													updateConnector(
														index,
														"target",
														value
													)
												}
											/>
										)}
									</>
								)}

								{connector.origin === "EVENT" && (
									<Select
										size="sm"
										label="Event auswählen"
										placeholder="Event auswählen..."
										options={props.events.map((event) => ({
											label: event.title,
											value: event._id,
										}))}
										value={connector.target}
										onChange={(value) =>
											updateConnector(
												index,
												"target",
												value
											)
										}
									/>
								)}

								{connector.origin === "SURVEY" && (
									<Select
										size="sm"
										label="Umfrage auswählen"
										placeholder="Umfrage auswählen..."
										options={props.surveys.map(
											(survey) => ({
												label: survey.title,
												value: survey._id,
											})
										)}
										value={connector.target}
										onChange={(value) =>
											updateConnector(
												index,
												"target",
												value
											)
										}
									/>
								)}

								<Flex
									direction="row"
									justify="flex-end"
								>
									<TouchableOpacity
										onPress={() => removeConnector(index)}
									>
										<IconTrash
											size={20}
											color={applyColor("red")}
										/>
									</TouchableOpacity>
								</Flex>
							</Flex>
						</Card>
					))}
				</Card>
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
					p="md"
				>
					<Text
						fs="lg"
						fw="bold"
						c="gray.8"
						mb="sm"
					>
						Materialien ({materials.length})
					</Text>
					<UVCMaterialForm
						materials={materials}
						setMaterials={setMaterials}
						newUploads={newUploads}
						setNewUploads={setNewUploads}
					/>
				</Card>
				{/* Submit Button */}
				<Button
					variant="filled"
					loading={props.loading}
					loadingText="Bitte warten..."
					onPress={handleSubmit}
					radius="xs"
					m="md"
					disabled={props.loading || !title.trim()}
				>
					{props.submitButtonText || "Speichern"}
				</Button>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default ProjectTaskForm;
