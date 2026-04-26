import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNews, updateNews } from "@/api/News";
import { useTenant } from "@/context/TenantContext";
import ContentEditor from "@/components/common/ContentEditor";
import SVHLoader from "@/components/common/SVHLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Flex, Text } from "@eduinteractive/balladui";

export default () => {
	const params = useLocalSearchParams();
	const newsId = typeof params.newsId === "string" ? params.newsId : "";
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();

	const newsQuery = useQuery({
		queryKey: ["news", currentTenant?.tenant!._id, newsId],
		queryFn: () =>
			getNews({
				tenantId: currentTenant!.tenant!._id,
				newsId,
			}),
		enabled: !!newsId && !!currentTenant?.tenant?._id,
	});

	const updateMutation = useMutation({
		mutationFn: updateNews,
		onSuccess: () => {
			NotificationHandler.showSuccess("Neuigkeit erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["news", currentTenant?._id] });
			queryClient.invalidateQueries({ queryKey: ["news", currentTenant?._id, newsId] });
			queryClient.invalidateQueries({ queryKey: ["profile", currentTenant?._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSave = (data: { title: string; content: string }) => {
		if (!data.title.trim()) {
			return NotificationHandler.showError("Bitte geben Sie einen Titel ein");
		}
		if (!data.content.trim()) {
			return NotificationHandler.showError("Bitte geben Sie Inhalt ein");
		}

		updateMutation.mutate({
			tenantId: currentTenant!._id,
			newsId,
			body: {
				title: data.title,
				content: data.content,
				image: newsQuery.data?.image,
			},
		});
	};

	if (newsQuery.isLoading) {
		return <SVHLoader />;
	}

	if (newsQuery.error) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text
					fs="sm"
					fw="bold"
				>
					Fehler beim Laden der Neuigkeit
				</Text>
			</Flex>
		);
	}

	if (!newsQuery.data) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text
					fs="sm"
					fw="bold"
				>
					Neuigkeit nicht gefunden
				</Text>
			</Flex>
		);
	}

	return (
		<ContentEditor
			initialTitle={newsQuery.data.title}
			initialContent={newsQuery.data.content}
			onSave={handleSave}
			isLoading={updateMutation.isPending}
		/>
	);
};
