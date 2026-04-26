import { deleteWikiSection, getWikiSection } from "@/api/Wiki";
import SVHLoader from "@/components/common/SVHLoader";
import { useTenant } from "@/context/TenantContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Alert, Linking, RefreshControl, ScrollView } from "react-native";
import Markdown from "react-native-markdown-display";
import { htmlToMarkdown } from "@/utils/Parser";
import React, { useLayoutEffect } from "react";
import { applySizeProp, Divider, Text } from "@eduinteractive/balladui";
import SVHMaterials from "@/components/common/SVHMaterials";
import { IconEdit, IconFiles, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { currentTenant } = useTenant();
	const { wikiId, sectionId } = useLocalSearchParams();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const wikiSectionQuery = useQuery({
		queryKey: ["wiki", currentTenant?._id, wikiId, sectionId],
		queryFn: () =>
			getWikiSection({
				tenantId: currentTenant!._id,
				wikiId: wikiId as string,
				sectionId: sectionId as string,
			}),
		enabled: !!wikiId && !!currentTenant,
	});

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diesen Abschnitt wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteWikiSection({
							tenantId: currentTenant!._id,
							wikiId: wikiId as string,
							sectionId: sectionId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["wiki", currentTenant?._id, wikiId],
						});
						router.back();
					} catch (error) {
						Alert.alert("Fehler", "Der Abschnitt konnte nicht gelöscht werden.");
					} finally {
						router.back();
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (wikiSectionQuery.data) {
			navigation.setOptions({
				title: wikiSectionQuery.data.title,
				headerRight: () => (
					<HeaderMenu
						options={[
							{
								label: "Inhalt Bearbeiten",
								value: "edit",
								icon: <IconEdit size={20} />,
							},
                            {
                                label: "Materialien bearbeiten",
                                value: "materials",
                                icon: <IconFiles size={20} />,
                            },
							{
								label: "Löschen",
								value: "delete",
								icon: <IconTrash size={20} />,
							},
						]}
						onSelect={(value) => {
							if (value === "edit")
								router.push(
									`/knowledge/wiki/${wikiId}/section/${sectionId}/edit`
								);
							if (value === "materials")
								router.push(
									`/knowledge/wiki/${wikiId}/section/${sectionId}/materials`
								);
							if (value === "delete") handleDelete();
						}}
					/>
				),
			});
		}
	}, [wikiSectionQuery.data, navigation]);

	if (wikiSectionQuery.isLoading || !wikiSectionQuery.data) {
		return <SVHLoader />;
	}

	const wiki = wikiSectionQuery.data;

	return (
		<ScrollView
			style={{
				backgroundColor: "white",
				padding: applySizeProp("sm"),
			}}
			refreshControl={
				<RefreshControl
					refreshing={wikiSectionQuery.isRefetching}
					onRefresh={() => wikiSectionQuery.refetch()}
				/>
			}
		>
			<Text
				fs="md"
				fw="bold"
			>
				{wiki.title}
			</Text>
			<Markdown>{htmlToMarkdown(wiki.content || "")}</Markdown>
			{wiki.materials.length > 0 && (
				<>
					<Divider my="sm" />
					<Text
						fs="sm"
						fw="bold"
						mb="sm"
					>
						Materialien
					</Text>
					<SVHMaterials materials={wiki.materials} onPress={(material) => 
                        Linking.openURL(
                            `https://apps.sv-hub.de/api/event/public/event/${
                                wikiId
                            }/download/${encodeURIComponent(
                                material.link
                            )}`
                        )
                    } />
				</>
			)}
		</ScrollView>
	);
};
