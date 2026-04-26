import React, { useState, useEffect } from "react";
import { ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from "react-native";
import { Flex, Text, Button, Card, TextInput, Select, Divider } from "@eduinteractive/balladui";
import { applyColor } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { IconPlus, IconTrash } from "@/assets/icons/Icon";

interface CustomField {
	key: string;
	value: string;
}

interface EventFieldsFormProps {
	fields: CustomField[];
	title: string;
	loading?: boolean;
	onSave: (fields: CustomField[]) => void;
}

interface FieldData {
	name: string;
	type: string;
	options: string[];
}

const fieldTypeOptions = [
	{ label: "Text", value: "text" },
	{ label: "Einfachauswahl", value: "single_choice" },
	{ label: "Mehrfachauswahl", value: "multiple_choice" },
];

export default function EventFieldsForm({
	fields,
	title,
	loading = false,
	onSave,
}: EventFieldsFormProps) {
	const [editingFields, setEditingFields] = useState<{ [key: string]: FieldData }>({});

	// Initialize editing fields from props and add empty field
	useEffect(() => {
		const initialEditingFields: { [key: string]: FieldData } = {};
		fields.forEach((field) => {
			initialEditingFields[field.key] = decodeField(field);
		});
		// Always add an empty field at the end
		setEditingFields(initialEditingFields);
	}, [fields]);

	// Decode base64 field data
	const decodeField = (field: CustomField): FieldData => {
		try {
			const name = atob(field.key);
			const parts = field.value.split(".");
			const type = atob(parts[0]);
			const options = parts.length > 1 ? parts.slice(1).map((option) => atob(option)) : [];
			return { name, type, options };
		} catch {
			return { name: field.key, type: "text", options: [] };
		}
	};

	// Encode field data to base64
	const encodeField = (fieldData: FieldData): CustomField => {
		const encodedKey = btoa(fieldData.name);
		let valueString = btoa(fieldData.type);
		if (fieldData.options.length > 0) {
			const encodedOptions = fieldData.options.map((option) => btoa(option));
			valueString = [btoa(fieldData.type), ...encodedOptions].join(".");
		}
		return { key: encodedKey, value: valueString };
	};

	const handleFieldChange = (fieldKey: string, updatedData: FieldData) => {
		setEditingFields((prev) => ({
			...prev,
			[fieldKey]: updatedData,
		}));
	};

	const handleSave = () => {
		// Filter out empty fields and convert to the expected format
		const validFields: CustomField[] = [];
		
		Object.entries(editingFields).forEach(([key, fieldData]) => {
			// Skip empty fields
			if (!fieldData.name.trim()) return;
			
			// Validate choice fields have options
			if ((fieldData.type === "single_choice" || fieldData.type === "multiple_choice") && fieldData.options.length === 0) {
				NotificationHandler.showError(`Feld "${fieldData.name}" benötigt mindestens eine Option.`);
				return;
			}

			// Check for duplicate names
			const encodedField = encodeField(fieldData);
			if (validFields.find((f) => f.key === encodedField.key)) {
				NotificationHandler.showError(`Ein Feld mit dem Namen "${fieldData.name}" existiert bereits.`);
				return;
			}

			validFields.push(encodedField);
		});

		// Update the fields
		onSave(validFields);
	};

	const handleDeleteField = (fieldKey: string) => {
		Alert.alert("Feld löschen", "Möchtest du dieses Feld wirklich löschen?", [
			{ text: "Abbrechen", style: "cancel" },
			{
				text: "Löschen",
				style: "destructive",
				onPress: () => {
					setEditingFields((prev) => {
						const newEditingFields = { ...prev };
						delete newEditingFields[fieldKey];
						return newEditingFields;
					});
				},
			},
		]);
	};

	const addOptionToField = (fieldKey: string) => {
		const currentField = editingFields[fieldKey];
		if (currentField) {
			const updatedField = {
				...currentField,
				options: [...currentField.options, "Neue Option"],
			};
			handleFieldChange(fieldKey, updatedField);
		}
	};

	const updateOptionInField = (fieldKey: string, optionIndex: number, value: string) => {
		const currentField = editingFields[fieldKey];
		if (currentField) {
			const updatedOptions = [...currentField.options];
			updatedOptions[optionIndex] = value;
			const updatedField = {
				...currentField,
				options: updatedOptions,
			};
			handleFieldChange(fieldKey, updatedField);
		}
	};

	const removeOptionFromField = (fieldKey: string, optionIndex: number) => {
		const currentField = editingFields[fieldKey];
		if (currentField) {
			const updatedField = {
				...currentField,
				options: currentField.options.filter((_, i) => i !== optionIndex),
			};
			handleFieldChange(fieldKey, updatedField);
		}
	};

	const addNewField = () => {
		const newFieldKey = `new_${Date.now()}`;
		setEditingFields((prev) => ({
			...prev,
			[newFieldKey]: { name: "", type: "text", options: [] },
		}));
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, flexGrow: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 250, backgroundColor: "white" }}
			>
				{/* Default Fields Section */}
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
						mb="sm"
						c="gray.8"
					>
						Standard-Felder
					</Text>

					<Card
						variant="outline"
						p="md"
						mb="sm"
						style={{ borderColor: "#e0e0e0" }}
					>
						<Text
							fs="sm"
							fw="bold"
						>
							Vor- und Nachname
						</Text>
						<Text
							fs="xs"
							c="gray.6"
						>
							Standard-Feld (erforderlich)
						</Text>
					</Card>

					<Card
						variant="outline"
						p="md"
						style={{ borderColor: "#e0e0e0" }}
					>
						<Text
							fs="sm"
							fw="bold"
						>
							E-Mail-Adresse
						</Text>
						<Text
							fs="xs"
							c="gray.6"
						>
							Standard-Feld (erforderlich)
						</Text>
					</Card>
				</Card>

				{/* Custom Fields Section */}
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
							Benutzerdefinierte Felder ({Object.keys(editingFields).filter(key => editingFields[key].name.trim()).length})
						</Text>
						<Button
							variant="subtle"
							onPress={addNewField}
						>
							<IconPlus
								size={20}
								color={applyColor("blue")}
							/>
						</Button>
					</Flex>
					
					{Object.entries(editingFields).map(([fieldKey, fieldData]) => {
						return (
							<Card
								key={fieldKey}
								variant="outline"
								p="md"
								mb="sm"
								style={{ borderColor: "#e0e0e0" }}
							>
								<Flex
									direction="column"
									gap="md"
								>
									{/* Field Name */}
									<TextInput
										size="sm"
										label="Feldname"
										placeholder="Feldname eingeben..."
										value={fieldData.name}
										onChangeText={(text) =>
											handleFieldChange(fieldKey, {
												...fieldData,
												name: text,
											})
										}
										onSubmitEditing={() =>
											Keyboard.dismiss()
										}
									/>

									{/* Field Type */}
									<Select
										size="sm"
										label="Feldtyp"
										placeholder="Feldtyp auswählen..."
										value={fieldData.type}
										onChange={(value) =>
											handleFieldChange(fieldKey, {
												...fieldData,
												type: value as string,
												options:
													value === "text"
														? []
														: fieldData.options,
											})
										}
										options={fieldTypeOptions}
									/>

									{/* Options for choice fields */}
									{(fieldData.type === "single_choice" ||
										fieldData.type ===
											"multiple_choice") && (
										<Flex
											direction="column"
											gap="sm"
										>
											<Flex
												direction="row"
												align="center"
												justify="space-between"
											>
												<Text
													fs="sm"
													fw="bold"
													c="gray.8"
												>
													Optionen
												</Text>
												<Button
													variant="subtle"
													size="sm"
													onPress={() =>
														addOptionToField(
															fieldKey
														)
													}
												>
													<IconPlus
														size={
															16
														}
														color={applyColor(
															"blue"
														)}
													/>
												</Button>
											</Flex>
											{fieldData.options.map(
												(option, index) => (
													<Flex
														key={
															index
														}
														direction="row"
														gap="sm"
														align="center"
													>
														<TextInput
															value={
																option
															}
															onChangeText={(
																text
															) =>
																updateOptionInField(
																	fieldKey,
																	index,
																	text
																)
															}
															placeholder={`Option ${
																index +
																1
															}`}
															size="sm"
															flex={
																1
															}
															onSubmitEditing={() =>
																Keyboard.dismiss()
															}
														/>
														<TouchableOpacity
															onPress={() =>
																removeOptionFromField(
																	fieldKey,
																	index
																)
															}
														>
															<IconTrash
																size={
																	20
																}
																color={applyColor(
																	"red"
																)}
															/>
														</TouchableOpacity>
													</Flex>
												)
											)}
											<Divider
												mt="sm"
												color="gray.4"
											/>
										</Flex>
									)}

									{/* Delete Field Button */}
									<Flex
										direction="row"
										justify="flex-end"
									>
										<TouchableOpacity
											onPress={() =>
												handleDeleteField(
													fieldKey
												)
											}
										>
											<IconTrash
												size={20}
												color={applyColor(
													"red"
												)}
											/>
										</TouchableOpacity>
									</Flex>
								</Flex>
							</Card>
						);
					})}
				</Card>

				{/* Submit Button */}
				<Button
					variant="filled"
					loading={loading}
					loadingText="Bitte warten..."
					onPress={handleSave}
					radius="xs"
					m="md"
					disabled={loading}
				>
					Änderungen speichern
				</Button>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
