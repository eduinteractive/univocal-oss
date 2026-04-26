import { SurveyMeta, SurveyComponent, SurveyResult } from "@/api/Survey";
import { Card, Flex, Text } from "@eduinteractive/balladui";
import dayjs from "dayjs";

interface SurveyGeneralProps {
	data?: {
		survey: SurveyMeta;
		components: SurveyComponent[];
		results: SurveyResult[];
	};
}

export default (props: SurveyGeneralProps) => {
	return (
		<Flex
			direction="column"
			gap="md"
            p="sm"
		>
			<Flex
				justify="space-between"
				align="flex-start"
			>
				<Flex
					direction="column"
					gap="sm"
				>
					<Text
						fs="xl"
						fw="bold"
					>
						{props.data?.survey?.title}
					</Text>
					<Text>{props.data?.survey?.description}</Text>
				</Flex>
			</Flex>

			<Flex
				direction="column"
				gap="sm"
				align="flex-end"
				mt="md"
			>
				<Text
					fs="sm"
					c="gray.4"
				>
					Erstellt am: {dayjs(props.data?.survey?.createdAt).format("DD.MM.YYYY HH:mm")}
				</Text>
				<Text
					fs="sm"
					c="gray.4"
				>
					Zuletzt aktualisiert am:{" "}
					{dayjs(props.data?.survey?.updatedAt).format("DD.MM.YYYY HH:mm")}
				</Text>
			</Flex>
		</Flex>
	);
};
