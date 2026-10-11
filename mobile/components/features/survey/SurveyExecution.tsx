import React from "react";
import { SurveyMeta, SurveyComponent, SurveyResult, SurveyExecutionMode } from "@/api/Survey";
import { Modal, ScrollView, Share, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { BASE_URL } from "@/api/APIHandler";
import { applyColor, Box, Button, DateInput, Flex, Text, TimeInput, applySizeProp, TextInput, Space, Switch } from "@eduinteractive/balladui";

const SURVEY_EXECUTION_MODE_STRINGS = {
	[SurveyExecutionMode.DEFAULT]: "Standard - Anonym ohne Einschränkungen",
	[SurveyExecutionMode.ANONYMOUS]: "Anonym - Nur eine Antwort pro Gerät",
	[SurveyExecutionMode.PERSONAL]: "Personalisiert",
	[SurveyExecutionMode.TAN]: "Umfragecodes",
};

interface SurveyExecutionProps {
	data?: {
		survey: SurveyMeta;
		components: SurveyComponent[];
		results: SurveyResult[];
	};
	onUpdate: (data: {
		isActive?: boolean;
		startDate?: Date | null;
		endDate?: Date | null;
		redirectionUrl?: string | null;
		showQuestionNumbers?: boolean;
	}) => Promise<void>;
	onGenerateCodes: (amount: number) => Promise<void>;
	onResetCodes: () => Promise<void>;
}

export default function SurveyExecution(props: SurveyExecutionProps) {
	const [isExecutionActive, setIsExecutionActive] = useState(props.data?.survey.options.isActive || false);
	const [showCodesModal, setShowCodesModal] = useState(false);
	const [codeAmount, setCodeAmount] = useState("1");
	const [showTans, setShowTans] = useState(false);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [redirectionUrl, setRedirectionUrl] = useState("");
	const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
	const [savingOptions, setSavingOptions] = useState(false);

	const surveyOptions = props.data?.survey?.options;

	useEffect(() => {
		if (!surveyOptions) return;
		setStartDate(surveyOptions.startDate ? new Date(surveyOptions.startDate) : null);
		setEndDate(surveyOptions.endDate ? new Date(surveyOptions.endDate) : null);
		setRedirectionUrl(surveyOptions.redirectionUrl || "");
		setShowQuestionNumbers(surveyOptions.showQuestionNumbers !== false);
	}, [
		surveyOptions,
		surveyOptions?.startDate,
		surveyOptions?.endDate,
		surveyOptions?.redirectionUrl,
		surveyOptions?.showQuestionNumbers,
	]);

	const surveyLink = `${BASE_URL}/survey-transaction/${props.data?.survey._id}`;

	const formatTime = (date: Date) =>
		`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

	const setDatePart = (current: Date | null, value: string) => {
		const next = new Date(value);
		const base = current ?? new Date();
		next.setHours(base.getHours(), base.getMinutes(), 0, 0);
		return next;
	};

	const setTimePart = (current: Date | null, time: string) => {
		const [hours, minutes] = time.split(":").map(Number);
		const next = new Date(current ?? new Date());
		next.setHours(hours, minutes, 0, 0);
		return next;
	};

	const saveOptions = async () => {
		if (startDate && endDate && startDate > endDate) {
			NotificationHandler.showError("Die Startzeit muss vor der Endzeit liegen.");
			return;
		}
		setSavingOptions(true);
		try {
			await props.onUpdate({
				startDate,
				endDate,
				redirectionUrl: redirectionUrl.trim() || null,
				showQuestionNumbers,
			});
		} finally {
			setSavingOptions(false);
		}
	};

	const handleShare = async () => {
		try {
			await Share.share({
				message: surveyLink,
			});
		} catch (error) {
			NotificationHandler.showError("Fehler beim Teilen des Links");
		}
	};

	const handleGenerateCodes = async () => {
		const amount = parseInt(codeAmount);
		if (isNaN(amount) || amount < 1) {
			NotificationHandler.showError("Bitte geben Sie eine gültige Anzahl ein");
			return;
		}
		await props.onGenerateCodes(amount);
		setShowCodesModal(false);
	};

	if (!props.data?.survey) {
		return null;
	}

	return (
		<ScrollView
			style={{ backgroundColor: "white" }}
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Flex
				gap="md"
				p="sm"
				direction="column"
			>
				<Flex
					direction="row"
					align="center"
					gap="md"
				>
					<Switch
						checked={isExecutionActive}
						onChange={async (value: boolean) => {
							setIsExecutionActive(value);
							await props.onUpdate({ isActive: value });
						}}
					/>
					<Flex
						flex={1}
						direction="column"
					>
						<Text
							fs="smd"
							fw="bold"
						>
							Umfrage aktivieren
						</Text>
						<Text fs="sm">
							Aktivieren Sie die Umfrage, um sie für die Teilnehmer sichtbar
							zu machen. Wenn die Umfrage aktiv ist oder Ergebnisse
							übermittelt wurden, kann sie nicht mehr bearbeitet werden.
						</Text>
					</Flex>
				</Flex>

				{isExecutionActive && (
					<Box
						bg={applyColor("gray.1")}
						p="sm"
						style={{ borderRadius: applySizeProp("sm") }}
					>
						<Flex
							gap="md"
							direction="column"
						>
							<Flex
								direction="column"
								gap="xs"
							>
								<Text
									fs="sm"
									c="gray.5"
								>
									Informationen zur Durchführung der Umfrage:
								</Text>
								<Text
									fs="xs"
									c="gray.5"
								>
									Umfrage-ID: {props.data.survey._id}
								</Text>
								<Text
									fs="xs"
									c="gray.5"
								>
									Umfragemodus:{" "}
									{
										SURVEY_EXECUTION_MODE_STRINGS[
											props.data.survey.options
												.executionMode
										]
									}
								</Text>
							</Flex>

							<Flex
								direction="row"
								gap="sm"
								wrap="wrap"
							>
								<Button
									variant="default"
									size="md"
									onPress={handleShare}
								>
									Link teilen
								</Button>

								{props.data.survey.options.executionMode ===
									SurveyExecutionMode.TAN && (
									<>
										<Button
											variant="default"
											size="md"
											onPress={() =>
												setShowCodesModal(true)
											}
										>
											Codes generieren
										</Button>
										<Button
											variant="default"
											size="md"
											onPress={props.onResetCodes}
										>
											Codes löschen
										</Button>
										<Button
											variant="default"
											size="md"
											onPress={() =>
												setShowTans(!showTans)
											}
										>
											{showTans
												? "Codes ausblenden"
												: "Codes anzeigen"}
										</Button>
									</>
								)}
							</Flex>

							{showTans && props.data.survey.options.tans && (
								<Flex gap="sm">
									{props.data.survey.options.tans.length === 0 ? (
										<Text fs="sm">
											Es wurden noch keine
											Umfragecodes generiert.
										</Text>
									) : (
										<Flex
											wrap="wrap"
											gap="sm"
										>
											{props.data.survey.options.tans.map(
												(tan) => (
													<Text
														key={
															tan.code
														}
														fs="xs"
														c="gray.5"
														style={{
															textDecorationLine:
																tan.isUsed
																	? "line-through"
																	: "none",
														}}
													>
														{
															tan.code
														}
													</Text>
												)
											)}
										</Flex>
									)}
								</Flex>
							)}
						</Flex>
					</Box>
				)}

				<Flex
					direction="column"
					gap="sm"
				>
					<Text
						fs="smd"
						fw="bold"
					>
						Zeitraum
					</Text>
					<Text fs="sm">
						Leer lassen, wenn die Umfrage sofort und ohne Endzeit erreichbar sein soll.
					</Text>
					{startDate ? (
						<Flex
							direction="column"
							gap="sm"
						>
							<Flex
								direction="row"
								gap="sm"
							>
								<DateInput
									size="sm"
									label="Startzeit"
									value={startDate}
									onChange={(value) => setStartDate(setDatePart(startDate, value))}
								/>
								<TimeInput
									size="sm"
									label="Uhrzeit"
									value={formatTime(startDate)}
									onChange={(time) => setStartDate(setTimePart(startDate, time))}
								/>
							</Flex>
							<Button
								variant="subtle"
								size="sm"
								onPress={() => setStartDate(null)}
							>
								Startzeit entfernen
							</Button>
						</Flex>
					) : (
						<Button
							variant="outline"
							onPress={() => setStartDate(new Date())}
						>
							Startzeit hinzufügen
						</Button>
					)}
					{endDate ? (
						<Flex
							direction="column"
							gap="sm"
						>
							<Flex
								direction="row"
								gap="sm"
							>
								<DateInput
									size="sm"
									label="Endzeit"
									value={endDate}
									onChange={(value) => setEndDate(setDatePart(endDate, value))}
								/>
								<TimeInput
									size="sm"
									label="Uhrzeit"
									value={formatTime(endDate)}
									onChange={(time) => setEndDate(setTimePart(endDate, time))}
								/>
							</Flex>
							<Button
								variant="subtle"
								size="sm"
								onPress={() => setEndDate(null)}
							>
								Endzeit entfernen
							</Button>
						</Flex>
					) : (
						<Button
							variant="outline"
							onPress={() => setEndDate(new Date())}
						>
							Endzeit hinzufügen
						</Button>
					)}
					<TextInput
						size="sm"
						label="Weiterleitungs-URL"
						placeholder="Weiterleitungs-URL eingeben..."
						value={redirectionUrl}
						onChangeText={setRedirectionUrl}
						autoCapitalize="none"
					/>
					<Text
						fs="xs"
						c="gray.5"
					>
						Nach Beantwortung der Umfrage wird die Person auf diese Adresse weitergeleitet.
					</Text>
					<Flex
						direction="row"
						align="center"
						gap="md"
					>
						<Switch
							checked={showQuestionNumbers}
							onChange={setShowQuestionNumbers}
						/>
						<Flex
							flex={1}
							direction="column"
						>
							<Text
								fs="smd"
								fw="bold"
							>
								Fragennummern anzeigen
							</Text>
							<Text fs="sm">
								Teilnehmende sehen bei jeder Frage eine fortlaufende Nummer.
							</Text>
						</Flex>
					</Flex>
					<Button
						variant="filled"
						loading={savingOptions}
						onPress={saveOptions}
					>
						Speichern
					</Button>
				</Flex>
			</Flex>

			<Modal
				visible={showCodesModal}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowCodesModal(false)}
			>
				<View style={{
					flex: 1,
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20
				}}>
					<View style={{
						backgroundColor: 'white',
						borderRadius: 12,
						padding: 20,
						width: '100%',
						maxWidth: 400,
						shadowColor: '#000',
						shadowOffset: {
							width: 0,
							height: 2,
						},
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
					}}>
						{/* Modal Header */}
						<Flex
							direction="row"
							justify="space-between"
							align="center"
							mb="md"
						>
							<Text
								fs="smd"
								fw="bold"
							>
								Umfragecodes generieren
							</Text>
							<TouchableOpacity
								onPress={() => setShowCodesModal(false)}
								style={{
									padding: 8,
									borderRadius: 4,
									backgroundColor: applyColor("gray.1")
								}}
							>
								<Text fs="sm" c="gray.6">✕</Text>
							</TouchableOpacity>
						</Flex>

						{/* Modal Body */}
						<Flex direction="column" gap="md" mb="lg">
							<Space h={10} />
							<TextInput
								label="Anzahl der Codes"
								placeholder="Anzahl eingeben..."
								size="sm"
								py="xl"
								value={codeAmount}
								onChangeText={setCodeAmount}
								keyboardType="numeric"
							/>
						</Flex>

						{/* Modal Footer */}
						<Flex direction="row" gap="sm">
							<Button
								variant="outline"
								onPress={() => setShowCodesModal(false)}
								style={{ flex: 1 }}
							>
								Abbrechen
							</Button>
							<Button
								onPress={handleGenerateCodes}
								style={{ flex: 1 }}
							>
								Codes generieren
							</Button>
						</Flex>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}
