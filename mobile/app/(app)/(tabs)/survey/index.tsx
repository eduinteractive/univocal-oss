import { deleteSurvey, getSurveys } from "@/api/Survey";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import { useTenant } from "@/context/TenantContext";
import { Box, Flex, FAB, Text } from "@eduinteractive/balladui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RelativePathString, useRouter } from "expo-router";
import { IconPlus } from "@/assets/icons/Icon";
import { NotificationHandler } from "@/utils/NotificationHandler";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();

	const surveysQuery = useQuery({
		queryKey: ["surveys", currentTenant?._id, {}],
		queryFn: () =>
			getSurveys({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const deleteSurveyMutation = useMutation({
		mutationFn: deleteSurvey,
		onSuccess: () => {
			surveysQuery.refetch();
			NotificationHandler.showSuccess("Umfrage erfolgreich gelöscht");
		},
		onError: NotificationHandler.showAxiosError,
	});

	return (
		<Box flex={1}>
			<UVCMetaCards
				permissionPrefix="surveys"
				data={surveysQuery.data || []}
				onOpen={(surveyId) => router.navigate(`/survey/${surveyId}` as RelativePathString)}
				onDelete={(surveyId) =>
					deleteSurveyMutation.mutate({ tenantId: currentTenant!._id, surveyId })
				}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() => router.navigate("/survey/new" as RelativePathString)}
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
						Neues Wiki
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
