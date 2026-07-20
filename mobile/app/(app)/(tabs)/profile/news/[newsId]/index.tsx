import { deleteNews, getNews } from "@/api/News";
import UVCLoader from "@/components/common/UVCLoader";
import ContentItemView from "@/components/common/ContentItemView";
import { useTenant } from "@/context/TenantContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Alert } from "react-native";
import { useLayoutEffect } from "react";
import { applyColor, Button, Flex } from "@eduinteractive/balladui";
import { IconEdit, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { currentTenant } = useTenant();
	const { newsId } = useLocalSearchParams();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const newsQuery = useQuery({
		queryKey: ["news", currentTenant?._id, newsId],
		queryFn: () =>
			getNews({
				tenantId: currentTenant!._id,
				newsId: newsId as string,
			}),
		enabled: !!newsId && !!currentTenant?._id,
	});

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diese Neuigkeit wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteNews({
							tenantId: currentTenant!._id,
							newsId: newsId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["profile", currentTenant?._id],
						});
						queryClient.invalidateQueries({
							queryKey: ["news", currentTenant?._id],
						});
						router.back();
					} catch (error) {
						Alert.alert("Fehler", "Die Neuigkeit konnte nicht gelöscht werden.");
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (newsQuery.data) {
			navigation.setOptions({
				title: newsQuery.data.title,
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "edit") router.push(`/profile/news/${newsId}/edit`);
                            if (value === "delete") handleDelete();
                        }}
                    />
				),
			});
		}
	}, [newsQuery.data, navigation]);

	if (newsQuery.isLoading || !newsQuery.data) {
		return <UVCLoader />;
	}

	return (
		<ContentItemView
			data={newsQuery.data}
			isRefreshing={newsQuery.isRefetching}
			onRefresh={() => newsQuery.refetch()}
		/>
	);
};
