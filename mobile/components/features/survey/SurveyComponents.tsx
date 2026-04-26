import {
	SurveyComponent,
	SurveyComponentType,
	SurveyComponentText,
	SurveyComponentLikert,
	SurveyComponentChoice,
	SurveyComponentNominal,
} from "@/api/Survey";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { Box, Text, Flex, applySizeProp, applyColor, Divider, Button } from "@eduinteractive/balladui";
import Markdown from "react-native-markdown-display";
import { htmlToMarkdown } from "@/utils/Parser";
import { router } from "expo-router";
import { IconArrowDown, IconArrowUp } from "@/assets/icons/Icon";

// TODO: Move these to a proper constants file
const SurveyComponentTypeStrings: Record<SurveyComponentType, string> = {
	[SurveyComponentType.TEXT]: "Text",
	[SurveyComponentType.LIKERT]: "Likert-Skala",
	[SurveyComponentType.CHOICE]: "Multiple Choice",
	[SurveyComponentType.OPEN]: "Offene Frage",
	[SurveyComponentType.WORDCLOUD]: "Wortwolke",
	[SurveyComponentType.NOMINAL]: "Nominal",
};

const SurveyComponentNominalScale: Record<string, string[]> = {
	YES_NO: ["Ja", "Nein"],
	YES_NO_MAYBE: ["Ja", "Nein", "Vielleicht"],
	AGREE_DISAGREE: ["Stimme zu", "Stimme nicht zu"],
	SATISFACTION: ["Sehr zufrieden", "Zufrieden", "Neutral", "Unzufrieden", "Sehr unzufrieden"],
};

interface SurveyComponentsProps {
	components: SurveyComponent[];
	surveyId?: string;
	onMoveUp?: (componentId: string) => void;
	onMoveDown?: (componentId: string) => void;
}

export default function SurveyComponents(props: SurveyComponentsProps) {
	const [orderedComponents, setOrderedComponents] = useState<SurveyComponent[]>([]);

	useEffect(() => {
		if (props.components) {
			const startComponent = props.components.find((c) => !c.previous);

			// If no start component is found, return empty list
			if (!startComponent) {
				setOrderedComponents([]);
				return;
			}

			// Create sorted list
			const sortedComponents = [startComponent];
			let currentComponent = startComponent;

			while (currentComponent && currentComponent.next) {
				const nextComponent = props.components.find((c) => c._id === currentComponent.next);
				if (nextComponent) {
					sortedComponents.push(nextComponent);
					currentComponent = nextComponent;
				} else {
					// Break if no next component is found
					break;
				}
			}
			setOrderedComponents(sortedComponents);
		}
	}, [props.components]);

	const renderComponentContent = (component: SurveyComponent) => {
		switch (component.type) {
			case SurveyComponentType.TEXT:
				return <Markdown>{htmlToMarkdown((component as SurveyComponentText).description || "")}</Markdown>;
			case SurveyComponentType.LIKERT:
				return (
					<Flex
						direction="row"
						wrap="wrap"
						gap="sm"
					>
						{(component as SurveyComponentLikert).scale.labels.map(
							(label: string, index: number) => (
								<Box
									key={index}
									px="smd"
									py="sm"
									style={{
										borderColor: applyColor("blue"),
                                        borderWidth: 1,
									}}
								>
									<Text c="blue">{label}</Text>
								</Box>
							)
						)}
					</Flex>
				);
			case SurveyComponentType.CHOICE:
				return (
					<Flex
						direction="column"
						gap="sm"
					>
						{(component as SurveyComponentChoice).choices.map(
							(label: string, index: number) => (
								<Flex
									key={index}
									direction="row"
									align="center"
									gap="sm"
								>
									<Box
										w={applySizeProp("smd")}
										h={applySizeProp("smd")}
										style={{
											borderColor: applyColor("gray.4"),
											borderRadius:
												applySizeProp("sm"),
                                            borderWidth: 1,
										}}
									/>
									<Text>{label}</Text>
								</Flex>
							)
						)}
					</Flex>
				);
			case SurveyComponentType.OPEN:
				return (
					<Box
						w="100%"
						style={{ borderRadius: 0, borderColor: applyColor("gray.2"), borderWidth: 1 }}
					>
						<Text c="gray.5" py="sm" px="xs">Antwort eingeben...</Text>
					</Box>
				);
			case SurveyComponentType.WORDCLOUD:
				return (
					<Box
						w="100%"
						style={{ borderRadius: 0, borderColor: applyColor("gray.2"), borderWidth: 1 }}
					>
						<Text c="gray.5" py="sm" px="xs">Antwort eingeben...</Text>
					</Box>
				);
			case SurveyComponentType.NOMINAL:
				return (
					<Flex
						direction="row"
						wrap="wrap"
						gap="xs"
					>
						{SurveyComponentNominalScale[
							(component as SurveyComponentNominal)
								.nominalType as keyof typeof SurveyComponentNominalScale
						].map((label: string, index: number) => (
							<Box
								key={label + index}
								className="border border-blue-500 rounded px-3 py-1"
							>
								<Text className="text-blue-500">{label}</Text>
							</Box>
						))}
					</Flex>
				);
			default:
				return <Text>Unbekannte Frage</Text>;
		}
	};

	const renderItem = ({ item: component, index }: { item: SurveyComponent; index: number }) => (
		<TouchableOpacity
			key={component._id}
			onPress={() => {
				if (props.surveyId) {
					router.push(`/survey/${props.surveyId}/component/${component._id}/edit`);
				}
			}}
		>
			<Box
				p="md"
				mb="sm"
				style={{ borderColor: applyColor("gray.2"), borderWidth: 1 }}
			>
				<Flex
					direction="column"
					gap="xs"
				>
					<Flex
						direction="row"
						align="center"
					>
						<Text fs="md" fw="bold">
							{component.title}
							{component.required && <Text c="red"> *</Text>}
						</Text>
					</Flex>
					<Text c="gray.5" mb="xs">
						{SurveyComponentTypeStrings[component.type as SurveyComponentType]}
					</Text>
					{renderComponentContent(component)}
				</Flex>
                <Divider color="gray.4" my="sm" mt="md" />
                <Flex direction="row" justify="flex-end" gap="xs">
					{/* Move Down Button - only show if not last item */}
					{index < orderedComponents.length - 1 && (
						<Button 
							variant="subtle" 
							onPress={() => props.onMoveDown?.(component._id)}
							disabled={!props.onMoveDown}
						>
							<IconArrowDown size={16} color={applyColor("gray.5")} />
						</Button>
					)}
					{/* Move Up Button - only show if not first item */}
					{index > 0 && (
						<Button 
							variant="subtle" 
							onPress={() => props.onMoveUp?.(component._id)}
							disabled={!props.onMoveUp}
						>
							<IconArrowUp size={16} color={applyColor("gray.5")} />
						</Button>
					)}
                </Flex>
			</Box>
		</TouchableOpacity>
	);

	return (
		<FlatList
			data={orderedComponents}
			renderItem={renderItem}
			keyExtractor={(item) => item._id}
			contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
		/>
	);
}
