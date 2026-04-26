import { deleteTenantProject, getTenantProject } from "@/api/TenantProject";
import SVHLoader from "@/components/common/SVHLoader";
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
	const { projectId } = useLocalSearchParams();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const projectQuery = useQuery({
		queryKey: ["project", currentTenant?._id, projectId],
		queryFn: () =>
			getTenantProject({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
			}),
		enabled: !!projectId && !!currentTenant?._id,
	});

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du dieses Projekt wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteTenantProject({
							tenantId: currentTenant!._id,
							projectId: projectId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["profile", currentTenant?._id],
						});
						queryClient.invalidateQueries({
							queryKey: ["projects", currentTenant?._id],
						});
						router.back();
					} catch (error) {
						Alert.alert("Fehler", "Das Projekt konnte nicht gelöscht werden.");
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (projectQuery.data) {
			navigation.setOptions({
				title: projectQuery.data.title,
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "edit") router.push(`/profile/project/${projectId}/edit`);
                            if (value === "delete") handleDelete();
                        }}
                    />
				),
			});
		}
	}, [projectQuery.data, navigation]);

	if (projectQuery.isLoading || !projectQuery.data) {
		return <SVHLoader />;
	}

	return (
		<ContentItemView
			data={projectQuery.data}
			isRefreshing={projectQuery.isRefetching}
			onRefresh={() => projectQuery.refetch()}
		/>
	);
};
