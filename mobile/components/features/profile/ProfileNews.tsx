import { News } from "@/api/News";
import { IconPlus } from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import { htmlToMarkdown } from "@/utils/Parser";
import { Flex, Text } from "@eduinteractive/balladui";
import { FAB } from "@eduinteractive/balladui";
import { Box } from "@eduinteractive/balladui";
import { router } from "expo-router";
import { RelativePathString } from "expo-router";

interface ProfileNewsProps {
	data?: {
		news: News[];
	};
	onOpenNews?: (newsId: string) => void;
	onDeleteNews?: (newsId: string) => void;
}

export default (props: ProfileNewsProps) => {
	return (
		<Box flex={1}>
			<UVCMetaCards
				data={
					props.data?.news.map((news) => ({
						...news,
						content: htmlToMarkdown(news.content || "", true),
					})) || []
				}
				onOpen={props.onOpenNews}
				onDelete={props.onDeleteNews}
				imageEnabled={true}
				permissionPrefix="news"
				deleteModal={{
					title: "Neuigkeit löschen",
					description: "Möchtest du diese Neuigkeit wirklich löschen?",
				}}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() => router.navigate("/profile/news/new" as RelativePathString)}
				position="absolute"
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
						Neue Neuigkeit
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
