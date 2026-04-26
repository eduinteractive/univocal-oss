import { getWikiSection, updateWikiSection, WikiSection } from "@/api/Wiki";
import { IconCheck } from "@/assets/icons/Icon";
import SVHLoader from "@/components/common/SVHLoader";
import SVHMaterialForm, { Material } from "@/components/common/SVHMaterialForm";
import { useTenant } from "@/context/TenantContext";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { applyColor, Button, Flex, Text } from "@eduinteractive/balladui";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";

export default () => {
	const params = useLocalSearchParams();
	const wikiId = typeof params.wikiId === "string" ? params.wikiId : "";
	const sectionId = typeof params.sectionId === "string" ? params.sectionId : "";
	const { currentTenant } = useTenant();
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const [title, setTitle] = useState<string>("");
	const [materials, setMaterials] = useState<Material[]>([]);
	const [newUploads, setNewUploads] = useState<any[]>([]);

	const wikiSectionQuery = useQuery<WikiSection>({
		queryKey: ["wiki", currentTenant!._id, wikiId, sectionId],
		queryFn: () =>
			getWikiSection({
				tenantId: currentTenant!._id,
				wikiId,
				sectionId,
			}),
		enabled: !!wikiId && !!sectionId && !!currentTenant,
	});

	useLayoutEffect(() => {
		if (wikiSectionQuery.data) {
			setTitle(wikiSectionQuery.data.title);
			setMaterials(wikiSectionQuery.data.materials || []);
		}
	}, [wikiSectionQuery.data]);

	const updateMutation = useMutation({
		mutationFn: updateWikiSection,
		onSuccess: () => {
			NotificationHandler.showSuccess("Änderungen gespeichert");
			queryClient.invalidateQueries({ queryKey: ["wiki", currentTenant!._id, wikiId, sectionId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	useLayoutEffect(() => {
		navigation.setOptions({
            title: wikiSectionQuery.data?.title,
			headerRight: () => (
				<Button
					variant="subtle"
					size="sm"
					loading={updateMutation.isPending}
					onPress={() =>
						updateMutation.mutate({
							tenantId: currentTenant!._id,
							wikiId,
							sectionId,
							body: {
								title,
								materials,
								newUploads,
							},
						})
					}
				>
					<IconCheck
						size={22}
						color={applyColor("blue")}
					/>
				</Button>
			),
		});
	}, [navigation, materials, title, updateMutation.isPending, newUploads]);

	if (wikiSectionQuery.isLoading) {
		return <SVHLoader />;
	}

	if (wikiSectionQuery.error) {
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
					Fehler beim Laden des Wiki-Abschnitts
				</Text>
			</Flex>
		);
	}

	if (!wikiSectionQuery.data) {
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
					Wiki-Abschnitt nicht gefunden
				</Text>
			</Flex>
		);
	}

	return (
		<Flex
			flex={1}
			bg="white"
			p={"sm"}
			position="relative"
			direction="column"
		>
            <Text
				fs="md"
				fw="bold"
                my="sm"
			>
				{title}
			</Text>
			<SVHMaterialForm
				materials={materials}
				setMaterials={setMaterials}
				newUploads={newUploads}
				setNewUploads={setNewUploads}
			/>
		</Flex>
	);
};
