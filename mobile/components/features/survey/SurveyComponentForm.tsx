import React, { useState, useEffect } from "react";
import { ScrollView, Alert } from "react-native";
import { Button, Flex, TextInput, Text, Checkbox, Card, Select } from "@eduinteractive/balladui";
import { applyColor } from "@eduinteractive/balladui";
import {
	SurveyComponentType,
	SurveyComponentNominalType,
	SurveyComponent,
	SurveyComponentText,
	SurveyComponentLikert,
	SurveyComponentChoice,
	SurveyComponentNominal,
} from "@/api/Survey";
import { IconTrash } from "@/assets/icons/Icon";

// Component type display names
const SurveyComponentTypeStrings: Record<SurveyComponentType, string> = {
	[SurveyComponentType.TEXT]: "Text",
	[SurveyComponentType.LIKERT]: "Likert-Skala",
	[SurveyComponentType.CHOICE]: "Multiple Choice",
	[SurveyComponentType.OPEN]: "Offene Frage",
	[SurveyComponentType.WORDCLOUD]: "Wortwolke",
	[SurveyComponentType.NOMINAL]: "Nominal",
};

const SurveyComponentNominalTypeStrings: Record<SurveyComponentNominalType, string> = {
	[SurveyComponentNominalType.YESNO]: "Ja/Nein",
	[SurveyComponentNominalType.CHECK]: "Check",
	[SurveyComponentNominalType.SEX]: "Geschlecht",
};

export interface SurveyComponentFormData {
	title: string;
	type: SurveyComponentType;
	required?: boolean;
	description?: string;
	scale?: {
		labels: string[];
	};
	choices?: string[];
	multiple?: boolean;
	max?: number;
	nominalType?: SurveyComponentNominalType;
}

interface SurveyComponentFormProps {
	initialData?: SurveyComponent;
	componentType?: SurveyComponentType;
	isActive?: boolean;
	loading?: boolean;
	onSubmit: (data: SurveyComponentFormData) => void;
	submitButtonText?: string;
	showTypeSelector?: boolean;
}

export default function SurveyComponentForm(props: SurveyComponentFormProps) {
	// Form state
	const [title, setTitle] = useState<string>("");
	const [type, setType] = useState<SurveyComponentType>(props.componentType || SurveyComponentType.TEXT);
	const [required, setRequired] = useState<boolean>(false);
	const [description, setDescription] = useState<string>("");
	const [scaleLabels, setScaleLabels] = useState<string[]>([]);
	const [choices, setChoices] = useState<string[]>([]);
	const [multiple, setMultiple] = useState<boolean>(false);
	const [max, setMax] = useState<string>("");
	const [nominalType, setNominalType] = useState<SurveyComponentNominalType>(SurveyComponentNominalType.YESNO);

	// Load initial data when component is available
	useEffect(() => {
		if (props.initialData) {
			setTitle(props.initialData.title);
			setType(props.initialData.type as SurveyComponentType);
			setRequired(props.initialData.required || false);

			switch (props.initialData.type) {
				case SurveyComponentType.TEXT:
					setDescription((props.initialData as SurveyComponentText).description || "");
					break;
				case SurveyComponentType.LIKERT:
					setScaleLabels((props.initialData as SurveyComponentLikert).scale.labels);
					break;
				case SurveyComponentType.CHOICE:
					const choiceComponent = props.initialData as SurveyComponentChoice;
					setChoices(choiceComponent.choices);
					setMultiple(choiceComponent.multiple);
					setMax(choiceComponent.max?.toString() || "");
					break;
				case SurveyComponentType.NOMINAL:
					setNominalType((props.initialData as SurveyComponentNominal).nominalType);
					break;
			}
		}
	}, [props.initialData]);

	const handleSubmit = () => {
		if (!title.trim()) {
			Alert.alert("Fehler", "Bitte gebe einen Titel ein");
			return;
		}

		// Build component-specific data
		let formData: SurveyComponentFormData = {
			type,
			title: title.trim(),
		};

		// Add required field for all components except TEXT
		if (type !== SurveyComponentType.WORDCLOUD && type !== SurveyComponentType.OPEN) {
			formData.required = required;
		}

		switch (type) {
			case SurveyComponentType.TEXT:
				formData.description = description.trim();
				break;
			case SurveyComponentType.LIKERT:
				if (scaleLabels.length < 2) {
					Alert.alert("Fehler", "Bitte gebe mindestens 2 Skalenwerte ein");
					return;
				}
				formData.scale = { labels: scaleLabels.filter((label) => label.trim()) };
				break;
			case SurveyComponentType.CHOICE:
				if (choices.length < 2) {
					Alert.alert("Fehler", "Bitte gebe mindestens 2 Auswahlmöglichkeiten ein");
					return;
				}
				formData.choices = choices.filter((choice) => choice.trim());
				formData.multiple = multiple;
				if (multiple && max.trim()) {
					const maxNum = parseInt(max);
					if (isNaN(maxNum) || maxNum < 1) {
						Alert.alert("Fehler", "Bitte gebe eine gültige maximale Anzahl ein");
						return;
					}
					formData.max = maxNum;
				}
				break;
			case SurveyComponentType.NOMINAL:
				formData.nominalType = nominalType;
				break;
		}

		props.onSubmit(formData);
	};

	const addScaleLabel = () => {
		setScaleLabels([...scaleLabels, ""]);
	};

	const updateScaleLabel = (index: number, value: string) => {
		const newLabels = [...scaleLabels];
		newLabels[index] = value;
		setScaleLabels(newLabels);
	};

	const removeScaleLabel = (index: number) => {
		setScaleLabels(scaleLabels.filter((_, i) => i !== index));
	};

	const addChoice = () => {
		setChoices([...choices, ""]);
	};

	const updateChoice = (index: number, value: string) => {
		const newChoices = [...choices];
		newChoices[index] = value;
		setChoices(newChoices);
	};

	const removeChoice = (index: number) => {
		setChoices(choices.filter((_, i) => i !== index));
	};

	const renderTypeSelector = () => {
		if (!props.showTypeSelector) return null;

		return (
			<Select
				label="Fragentyp"
				placeholder="Fragentyp auswählen..."
				size="sm"
				value={type}
				options={Object.entries(SurveyComponentTypeStrings).map(([key, label]) => ({
					label,
					value: key,
				}))}
				onChange={(value) => {
					setType(value as SurveyComponentType);
					// Reset type-specific fields when changing type
					setDescription("");
					setScaleLabels([]);
					setChoices([]);
					setMultiple(false);
					setMax("");
					setNominalType(SurveyComponentNominalType.YESNO);
				}}
			/>
		);
	};

	const renderComponentSpecificFields = () => {
		switch (type) {
			case SurveyComponentType.TEXT:
				return (
					<TextInput
						size="sm"
						label="Beschreibung"
						placeholder="Beschreibung eingeben..."
						value={description}
						onChangeText={setDescription}
						multiline
						numberOfLines={4}
					/>
				);

			case SurveyComponentType.LIKERT:
				return (
					<Flex
						direction="column"
						gap="sm"
					>
						<Text fw="600">Skalenwerte</Text>
						{scaleLabels.map((label, index) => (
							<Flex
								key={index}
								direction="row"
								gap="sm"
								align="center"
							>
								<TextInput
									size="sm"
									placeholder={`Skalenwert ${index + 1}`}
									value={label}
									onChangeText={(value) =>
										updateScaleLabel(index, value)
									}
									style={{ flex: 1 }}
								/>
								<Button
									variant="subtle"
									size="sm"
									onPress={() => removeScaleLabel(index)}
								>
									<IconTrash
										size={16}
										color={applyColor("red")}
									/>
								</Button>
							</Flex>
						))}
						<Button
							variant="outline"
							color="gray.6"
							size="sm"
							onPress={addScaleLabel}
							style={{ borderWidth: 1 }}
						>
							Skalenwert hinzufügen
						</Button>
					</Flex>
				);

			case SurveyComponentType.CHOICE:
				return (
					<Flex
						direction="column"
						gap="sm"
					>
						<Text fw="600">Auswahlmöglichkeiten</Text>
						{choices.map((choice, index) => (
							<Flex
								key={index}
								direction="row"
								gap="sm"
								align="center"
							>
								<TextInput
									size="sm"
									placeholder={`Auswahl ${index + 1}`}
									value={choice}
									onChangeText={(value) =>
										updateChoice(index, value)
									}
									rightSection={
										<Button
											variant="subtle"
											size="sm"
											onPress={() =>
												removeChoice(index)
                                            }
										>
											<IconTrash
												size={16}
												color={applyColor(
													"red"
												)}
											/>
										</Button>
									}
								/>
							</Flex>
						))}
						<Button
							variant="outline"
							size="sm"
							onPress={addChoice}
							style={{ borderWidth: 1 }}
							color="gray.6"
						>
							Auswahl hinzufügen
						</Button>

						<Checkbox
							checked={multiple}
							onChange={setMultiple}
							label="Sollen mehrere Antwortmöglichkeiten ausgewählt werden können?"
							my="sm"
						/>

						{multiple && (
							<TextInput
								size="sm"
								label="Maximale Anzahl (optional)"
								placeholder="z.B. 3"
								value={max}
								onChangeText={setMax}
								keyboardType="number-pad"
							/>
						)}
					</Flex>
				);

			case SurveyComponentType.NOMINAL:
				return (
					<Select
						label="Nominal-Typ"
						placeholder="Nominal-Typ auswählen..."
						size="sm"
						value={nominalType}
						options={Object.entries(SurveyComponentNominalTypeStrings).map(
							([key, label]) => ({
								label,
								value: key,
							})
						)}
						onChange={(value) =>
							setNominalType(value as SurveyComponentNominalType)
						}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<ScrollView
			style={{ backgroundColor: "white" }}
			contentContainerStyle={{ flexGrow: 1 }}
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
						Allgemeine Einstellungen
					</Text>

					{renderTypeSelector()}

					<TextInput
						size="sm"
						label="Titel"
						placeholder="Titel der Frage eingeben..."
						value={title}
						onChangeText={setTitle}
						required
					/>

					{type !== SurveyComponentType.TEXT && (
						<Checkbox
							checked={required}
							onChange={setRequired}
							label="Soll die Frage ein Pflichtfeld sein?"
						/>
					)}
				</Flex>
			</Card>

			{type !== SurveyComponentType.WORDCLOUD && type !== SurveyComponentType.OPEN && (
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
						{renderComponentSpecificFields()}
					</Flex>
				</Card>
			)}

			<Button
				variant="filled"
				loading={props.loading}
				loadingText="Bitte warten..."
				onPress={handleSubmit}
				m="md"
			>
				{props.submitButtonText || "Komponente speichern"}
			</Button>
		</ScrollView>
	);
}
