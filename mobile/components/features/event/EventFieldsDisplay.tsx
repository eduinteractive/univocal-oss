import React, { useState } from "react";
import { FlatList, Switch, Share } from "react-native";
import { Flex, Text, Button, Box, Card, applyColor, applySizeProp } from "@eduinteractive/balladui";
import { RelativePathString, useRouter, useLocalSearchParams } from "expo-router";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { IconEdit } from "@/assets/icons/Icon";

const fieldTypeOptions = [
	{ label: "Text", value: "text" },
	{ label: "Einfachauswahl", value: "single_choice" },
	{ label: "Mehrfachauswahl", value: "multiple_choice" },
];

interface CustomField {
	key: string;
	value: string;
}

interface ParticipantData {
	_id: string;
	personal: {
		firstName: string;
		lastName: string;
		email: string;
	};
	customFields?: { [key: string]: any };
}

interface EventFieldsDisplayProps {
	title: string;
	editRoute: string;
	fields?: CustomField[];
	participants: ParticipantData[];
	participantLabel: string;
	emptyMessage: string;
	enabledInitially: boolean;
	enableLabel: string;
	enableDescription: string;
	onToggleEnabled: (enabled: boolean, fields: CustomField[]) => void;
	additionalContent?: React.ReactNode;
	linkUrl?: string;
	linkLabel?: string;
	eventId?: string;
}

export default function EventFieldsDisplay({
	title,
	editRoute,
	fields = [],
	participants,
	participantLabel,
	emptyMessage,
	enabledInitially,
	enableLabel,
	enableDescription,
	onToggleEnabled,
	additionalContent,
	linkUrl,
	linkLabel,
	eventId,
}: EventFieldsDisplayProps) {
	const router = useRouter();
	const { eventId: localEventId } = useLocalSearchParams<{ eventId: string }>();
	const [enabled, setEnabled] = useState(enabledInitially);

	// Base64 validation function from EventCustomTable
	const isBase64 = (str: string) => {
		try {
			return btoa(atob(str)) === str;
		} catch (err) {
			return false;
		}
	};

	// Decode base64 field names for display
	const decodeFieldName = (encodedKey: string) => {
		try {
			return atob(encodedKey);
		} catch {
			return encodedKey;
		}
	};

	const decodeFieldValue = (encodedValue: string) => {
		try {
			const parts = encodedValue.split(".");
			const fieldType = atob(parts[0]);
			return fieldType;
		} catch {
			return "text";
		}
	};

	// Decode custom field values using the same principle as EventCustomTable
	const decodeCustomFieldValue = (customField: any) => {
		if (typeof customField === 'string') {
			// Check if the string is Base64-encoded
			if (isBase64(customField)) {
				return atob(customField);
			} else {
				return customField;
			}
		} else if (Array.isArray(customField)) {
			// Check each element in the array
			return customField
				.map((val) =>
					isBase64(val) ? atob(val) : val
				)
				.join(', ');
		}
		return String(customField);
	};

	const handleToggleEnabled = async () => {
		const newValue = !enabled;
		setEnabled(newValue);
		await onToggleEnabled(newValue, fields);
	};

	const handleShare = async () => {
		if (!linkUrl) return;
		try {
			await Share.share({
				message: linkUrl,
			});
		} catch (error) {
			NotificationHandler.showError("Fehler beim Teilen des Links");
		}
	};

	const renderParticipantItem = ({ item }: { item: ParticipantData }) => (
		<Card
			variant="outline"
			bg="white"
			radius={0}
			style={{ borderTopWidth: 0.25, borderBottomWidth: 0.25 }}
			p="md"
		>
			<Flex
				direction="column"
				gap="xs"
			>
				<Text fw="bold">
					{item.personal.firstName} {item.personal.lastName}
				</Text>
				<Text
					fs="sm"
					c="gray.6"
				>
					{item.personal.email}
				</Text>
				{/* Display custom field values */}
				{item.customFields && Object.keys(item.customFields).length > 0 && (
					<Flex
						direction="column"
						gap="xs"
						mt="xs"
					>
						{Object.entries(item.customFields).map(([key, value]) => (
							<Text
								key={key}
								fs="xs"
								c="gray.7"
							>
								{decodeFieldName(key)}: {decodeCustomFieldValue(value)}
							</Text>
						))}
					</Flex>
				)}
			</Flex>
		</Card>
	);

	const renderListFooter = () => (
		<Flex
			direction="column"
			gap="sm"
			mt="md"
			px="sm"
		>
			{additionalContent}
		</Flex>
	);

	const renderListHeader = () => (
		<>
			{/* Enable/Disable Toggle */}
			<Flex
				direction="row"
				align="center"
				gap="md"
				p="sm"
			>
				<Switch
					value={enabled}
					onValueChange={handleToggleEnabled}
				/>
				<Flex
					flex={1}
					direction="column"
				>
					<Text
						fs="smd"
						fw="bold"
					>
						{enableLabel}
					</Text>
					<Text fs="sm">{enableDescription}</Text>
				</Flex>
			</Flex>

			{/* Link Information - shown directly below toggle when enabled */}
			{enabled && linkUrl && (
				<Box
					bg={applyColor("gray.1")}
					p="sm"
					mx="sm"
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
								{linkLabel || "Informationen"}:
							</Text>
							<Text
								fs="xs"
								c="gray.5"
							>
								Event-ID: {eventId}
							</Text>
							<Text
								fs="xs"
								c="gray.5"
							>
								Link: {linkUrl}
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
						</Flex>
					</Flex>
				</Box>
			)}

			{enabled && (
				<>
					{/* Fields Configuration Section */}
					<Flex
						direction="column"
						gap="sm"
						mt="md"
						px="sm"
					>
						<Flex
							direction="row"
							justify="space-between"
							align="center"
						>
							<Text
								fs="md"
								fw="bold"
							>
								{title}
							</Text>
							<Button
								variant="subtle"
								size="sm"
								onPress={() =>
									router.push(
										`/events/${localEventId}/${editRoute}` as RelativePathString
									)
								}
							>
								<IconEdit
									size={16}
								/>
							</Button>
						</Flex>

						{/* Default Fields */}
						<Box
							p="sm"
							style={{
								backgroundColor: "#f9f9f9",
								borderRadius: 8,
								borderWidth: 1,
								borderColor: "#e0e0e0",
							}}
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
						</Box>

						<Box
							p="sm"
							style={{
								backgroundColor: "#f9f9f9",
								borderRadius: 8,
								borderWidth: 1,
								borderColor: "#e0e0e0",
							}}
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
						</Box>

						{/* Custom Fields */}
						{fields.map((field) => (
							<Box
								key={field.key}
								p="sm"
								style={{
									backgroundColor: "#f5f5f5",
									borderRadius: 8,
									borderWidth: 1,
									borderColor: "#e0e0e0",
								}}
							>
								<Text
									fs="sm"
									fw="bold"
								>
									{decodeFieldName(field.key)}
								</Text>
								<Text
									fs="xs"
									c="gray.6"
								>
									Typ: {fieldTypeOptions.find((option) => option.value === decodeFieldValue(field.value))?.label || "Text"}
								</Text>
							</Box>
						))}
					</Flex>

					{/* Participants Section Header */}
					<Flex
						direction="column"
						gap="sm"
						mt="md"
						px="sm"
						mb="sm"
					>
						<Text
							fs="md"
							fw="bold"
						>
							{participantLabel} ({participants.length})
						</Text>

						{participants.length === 0 && <Text c="gray.4">{emptyMessage}</Text>}
					</Flex>
				</>
			)}
		</>
	);

	return (
		<Box flex={1}>
			<FlatList
				data={enabled ? participants : []}
				renderItem={renderParticipantItem}
				keyExtractor={(item) => item._id}
				ListHeaderComponent={renderListHeader}
				ListFooterComponent={renderListFooter}
				showsVerticalScrollIndicator={false}
				nestedScrollEnabled={true}
			/>
		</Box>
	);
}
