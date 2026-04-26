import {
	SurveyComponent,
	SurveyComponentType,
	SurveyComponentChoice,
	SurveyComponentLikert,
	SurveyComponentNominal,
	SurveyResult,
	SurveyMeta,
} from "@/api/Survey";
import { useEffect, useState } from "react";
import { BarChart } from "react-native-gifted-charts";
import { ScrollView, Pressable, TextInput, RefreshControl } from "react-native";
import React from "react";
import { applyColor, applySizeProp, Card, Flex, Text, Box, Divider } from "@eduinteractive/balladui";

// TODO: Move these to a proper constants file
const SurveyComponentNominalScale: Record<string, string[]> = {
	YESNO: ["Ja", "Nein"],
	CHECK: ["Ja", "Nein", "Vielleicht"],
	SEX: ["Männlich", "Weiblich", "Divers"],
};

interface SurveyComponentWithResults extends SurveyComponent {
	results: unknown[];
}

interface SurveyResultsProps {
	data?: {
		survey: SurveyMeta;
		components: SurveyComponent[];
		results: SurveyResult[];
	};
	refreshing: boolean;
	onRefresh: () => void;
}

export default function SurveyResults(props: SurveyResultsProps) {
	const [components, setComponents] = useState<SurveyComponentWithResults[]>([]);
	const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (props.data) {
			const startComponent = props.data.components.find((c) => !c.previous);

			if (!startComponent) {
				setComponents([]);
			} else {
				const sortedComponents: SurveyComponentWithResults[] = [];
				let currentComponent: SurveyComponent | null = startComponent;

				while (currentComponent) {
					if (currentComponent.type !== SurveyComponentType.TEXT) {
						const componentAnswers = props.data.results
							.map(
								(result: SurveyResult) =>
									result.answers[currentComponent!._id]
							)
							.filter((answer) => answer !== undefined && answer !== null);

						sortedComponents.push({
							...currentComponent,
							results: componentAnswers,
						});
					}
					const nextComponent = props.data.components.find(
						(c) => c._id === currentComponent!.next
					);
					if (nextComponent) {
						currentComponent = nextComponent;
					} else {
						currentComponent = null;
					}
				}
				setComponents(sortedComponents);
			}
		}
	}, [props.data]);

	const toggleQuestion = (componentId: string) => {
		setExpandedQuestions((prev) => ({
			...prev,
			[componentId]: !prev[componentId],
		}));
	};

	const renderResult = (component: SurveyComponentWithResults) => {
		const barData = (() => {
			switch (component.type) {
				case SurveyComponentType.LIKERT: {
					const likertComponent = component as unknown as SurveyComponentLikert;
					return likertComponent.scale.labels.map((label, index) => {
						const count = component.results.reduce(
							(acc: number, result: unknown) =>
								acc + (result === index ? 1 : 0),
							0
						);
						return {
							value: count,
							label,
							frontColor: "#3b82f6",
							labelTextStyle: {
								fontSize: 11,
							},
						};
					});
				}
				case SurveyComponentType.NOMINAL: {
					const nominalComponent = component as unknown as SurveyComponentNominal;
                    console.log(nominalComponent.nominalType);
					return SurveyComponentNominalScale[nominalComponent.nominalType].map(
						(label, index) => {
							const count = component.results.reduce(
								(acc: number, result: unknown) =>
									acc + (result === index ? 1 : 0),
								0
							);
							return {
								value: count,
								label,
								labelTextStyle: {
									fontSize: 11,
								},
							};
						}
					);
				}
				case SurveyComponentType.CHOICE: {
					const choiceComponent = component as unknown as SurveyComponentChoice;
					return choiceComponent.choices.map((choice, index) => {
						const count = component.results.reduce(
							(acc: number, result: unknown) => {
								if (Array.isArray(result)) {
									return (
										acc +
										result.filter((r) => r === index).length
									);
								}
								return acc;
							},
							0
						);
						return {
							value: count,
							label: choice,
							frontColor: "#3b82f6",
							labelTextStyle: {
								fontSize: 11,
								padding: 5,
							},
						};
					});
				}
				default:
					return [];
			}
		})();

		return (
			<Card
				key={component._id}
				variant="outline"
				p="sm"
				mb="sm"
				radius={0}
			>
				<Flex
					gap="sm"
					w="100%"
					direction="column"
				>
					<TextInput
						value={component.title}
						editable={false}
						multiline
						className="text-lg font-bold text-blue-500"
					/>
					{component.type === SurveyComponentType.OPEN && (
						<Flex
							direction="column"
							gap="sm"
						>
							{component.results
								.slice(0, 3)
								.map((result: unknown, index: number) => (
									<Box
										key={index}
										style={{
											borderLeftWidth: 2,
											borderLeftColor: applyColor("primary"),
											paddingLeft: applySizeProp("sm"),
										}}
									>
										<TextInput
											value={result as string}
											editable={false}
											multiline
										/>
									</Box>
								))}
							{component.results.length > 3 && (
								<>
									{expandedQuestions[component._id] && (
										<Flex
											direction="column"
											gap="sm"
										>
											{component.results
												.slice(3)
												.map(
													(
														result: unknown,
														index: number
													) => (
														<Box
															key={
																index +
																3
															}
                                                            style={{
                                                                borderLeftWidth: 2,
                                                                borderLeftColor: applyColor("primary"),
                                                                paddingLeft: applySizeProp("sm"),
                                                            }}
														>
															<TextInput
																value={
																	result as string
																}
																editable={
																	false
																}
																multiline
															/>
														</Box>
													)
												)}
										</Flex>
									)}
									<Pressable
										onPress={() =>
											toggleQuestion(component._id)
										}
										className="mt-2"
									>
										<Text
											c="blue"
											style={{
												textDecorationColor:
													applyColor(
														"blue"
													),
												textDecorationLine:
													"underline",
											}}
										>
											{expandedQuestions[
												component._id
											]
												? "Weniger anzeigen"
												: `${
														component
															.results
															.length -
														3
												  } weitere Antworten anzeigen`}
										</Text>
									</Pressable>
								</>
							)}
						</Flex>
					)}
					{(component.type === SurveyComponentType.LIKERT ||
						component.type === SurveyComponentType.NOMINAL ||
						component.type === SurveyComponentType.CHOICE) && (
						<Flex
							w="100%"
							mt="sm"
							direction="column"
						>
							<BarChart
								data={barData}
								barWidth={22}
								spacing={30}
								hideRules
								xAxisThickness={1}
								yAxisThickness={1}
								yAxisTextStyle={{ color: "#666" }}
								noOfSections={4}
								maxValue={Math.max(...barData.map((d) => d.value))}
								width={300}
								initialSpacing={10}
								endSpacing={5}
								height={200}
								frontColor="#3b82f6"
								hideOrigin
							/>
							<Divider
								my="md"
								color="gray.4"
							/>
							<Flex
								gap="xs"
								direction="column"
								pb="sm"
							>
								{barData.map((item, index) => (
									<Flex
										key={index}
										gap="sm"
										direction="row"
										align="center"
										wrap="wrap"
									>
										<Box
											w={10}
											h={10}
											style={{
												backgroundColor:
													applyColor(
														"blue"
													),
												borderRadius:
													applySizeProp(
														"xl"
													),
											}}
										/>
										<Text
											selectable
											fs="sm"
											c="gray.5"
										>
											{item.label}
										</Text>
										<Text
											selectable
											fs="sm"
											c="gray.5"
										>
											({item.value})
										</Text>
									</Flex>
								))}
							</Flex>
						</Flex>
					)}
				</Flex>
			</Card>
		);
	};

	return (
		<ScrollView
			style={{ padding: applySizeProp("sm"), backgroundColor: "white" }}
			refreshControl={
				<RefreshControl
					refreshing={props.refreshing}
					onRefresh={props.onRefresh}
				/>
			}
		>
			<Flex
				gap="md"
				direction="column"
			>
				{components.map(renderResult)}
			</Flex>
		</ScrollView>
	);
}
