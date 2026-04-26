import { SurveyMeta, SurveyComponent, SurveyResult } from "@/api/Survey";
import SurveyComponents from "./SurveyComponents";
import { Box, Flex, FAB, Text } from "@eduinteractive/balladui";
import { RelativePathString, router } from "expo-router";   
import { IconPlus } from "@/assets/icons/Icon";

interface SurveyQuestionsProps {
	data?: {
		survey: SurveyMeta;
		components: SurveyComponent[];
		results: SurveyResult[];
	};
	onMoveUp?: (componentId: string) => void;
	onMoveDown?: (componentId: string) => void;
}

export default (props: SurveyQuestionsProps) => {

	return (
		<Box
			p="sm"
			bg="white"
			style={{ flex: 1 }}
		>
			<SurveyComponents
				components={props.data?.components || []}
				surveyId={props.data?.survey._id}
				onMoveUp={props.onMoveUp}
				onMoveDown={props.onMoveDown}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() =>
					router.push(
						`/survey/${props.data?.survey._id}/component/new` as RelativePathString
					)
				}
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
						Neue Frage
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
