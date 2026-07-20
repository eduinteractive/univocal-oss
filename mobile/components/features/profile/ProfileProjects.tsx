import { TenantProject } from "@/api/TenantProject";
import { IconPlus } from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import { htmlToMarkdown } from "@/utils/Parser";
import { Box, FAB } from "@eduinteractive/balladui";
import { RelativePathString } from "expo-router";
import { router } from "expo-router";
import { Flex } from "@eduinteractive/balladui";
import { Text } from "@eduinteractive/balladui";

interface ProfileProjectsProps {
	data?: {
		projects: TenantProject[];
	};
	onOpenProject?: (projectId: string) => void;
	onDeleteProject?: (projectId: string) => void;
}

export default (props: ProfileProjectsProps) => {
	return (
        <Box flex={1}>
		<UVCMetaCards
			data={
				props.data?.projects.map((project) => ({
					...project,
					content: htmlToMarkdown(project.content || "", true),
				})) || []
			}
			onOpen={props.onOpenProject}
			onDelete={props.onDeleteProject}
			imageEnabled={true}
			permissionPrefix="project"
			deleteModal={{
				title: "Projekt löschen",
					description: "Möchtest du dieses Projekt wirklich löschen?",
				}}
			/>
            <FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() => router.navigate("/profile/project/new" as RelativePathString)}
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
						Neues Projekt
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
