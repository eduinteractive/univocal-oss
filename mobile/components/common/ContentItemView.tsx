import { Card, Flex, Text } from "@eduinteractive/balladui";
import { BASE_URL } from "@/api/APIHandler";
import { Image, ScrollView, RefreshControl } from "react-native";
import { PROFILE_OBJECT_STATUS } from "@/constants/Enums";
import Markdown from "react-native-markdown-display";
import { htmlToMarkdown } from "@/utils/Parser";
import { applySizeProp } from "@eduinteractive/balladui";

interface ContentItem {
	_id?: string;
	title: string;
	content: string;
	image?: string;
	status: PROFILE_OBJECT_STATUS;
	createdAt: Date;
	updatedAt: Date;
	publishDate?: Date;
}

interface ContentItemViewProps {
	data: ContentItem;
	isRefreshing?: boolean;
	onRefresh?: () => void;
}

const ContentItemView = (props: ContentItemViewProps) => {
	const { data } = props;

	const getStatusText = (status: PROFILE_OBJECT_STATUS) => {
		switch (status) {
			case PROFILE_OBJECT_STATUS.DRAFT:
				return "Entwurf";
			case PROFILE_OBJECT_STATUS.EXAMINATION:
				return "Prüfung";
			case PROFILE_OBJECT_STATUS.PUBLISHED:
				return "Veröffentlicht";
			default:
				return "Unbekannt";
		}
	};

	const getStatusColor = (status: PROFILE_OBJECT_STATUS) => {
		switch (status) {
			case PROFILE_OBJECT_STATUS.DRAFT:
				return "orange.5";
			case PROFILE_OBJECT_STATUS.EXAMINATION:
				return "blue.5";
			case PROFILE_OBJECT_STATUS.PUBLISHED:
				return "green.5";
			default:
				return "gray.4";
		}
	};

	return (
		<ScrollView
			style={{
				backgroundColor: "white",
				padding: applySizeProp("sm"),
			}}
			refreshControl={
				<RefreshControl
					refreshing={props.isRefreshing || false}
					onRefresh={props.onRefresh}
				/>
			}
		>
			{/* Metadata Card */}
			<Card
				p="md"
				variant="filled"
				radius="sm"
				mb="md"
			>
				{/* Image */}
				{data.image && (
					<Image
						source={{
							uri: `${BASE_URL}/api/profile/image/${encodeURIComponent(data.image)}`
						}}
						style={{
							width: "100%",
							height: 200,
							borderRadius: 8,
							marginBottom: 16,
						}}
						resizeMode="cover"
					/>
				)}

				{/* Title and Status */}
				<Flex
					direction="row"
					justify="space-between"
					align="flex-start"
					mb="sm"
				>
					<Text
						fs="lg"
						fw="bold"
						flex={1}
						numberOfLines={2}
					>
						{data.title}
					</Text>
					<Text
						fs="sm"
						c={getStatusColor(data.status)}
						ml="sm"
					>
						{getStatusText(data.status)}
					</Text>
				</Flex>

				{/* Dates */}
				<Flex
					direction="column"
					gap="xs"
				>
					<Text
						fs="xs"
						c="gray.4"
					>
						Erstellt: {new Date(data.createdAt).toLocaleDateString()}
					</Text>
					<Text
						fs="xs"
						c="gray.4"
					>
						Zuletzt aktualisiert: {new Date(data.updatedAt).toLocaleDateString()}
					</Text>
					{data.publishDate && (
						<Text
							fs="xs"
							c="gray.4"
						>
							Veröffentlicht: {new Date(data.publishDate).toLocaleDateString()}
						</Text>
					)}
				</Flex>
			</Card>

			{/* Content */}
			<Card
				p="md"
				variant="filled"
				radius="sm"
			>
				<Text
					fs="md"
					fw="bold"
					mb="sm"
				>
					Inhalt
				</Text>
				<Markdown>{htmlToMarkdown(data.content || "")}</Markdown>
			</Card>
		</ScrollView>
	);
};

export default ContentItemView; 