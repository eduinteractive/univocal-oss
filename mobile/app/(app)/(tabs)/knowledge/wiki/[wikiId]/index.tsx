import { getWiki, updateWiki } from "@/api/Wiki";
import SVHLoader from "@/components/common/SVHLoader";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RelativePathString, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { NotificationHandler } from "@/utils/NotificationHandler";
import React from "react";
import { Flex, FAB, Text, Card, Box } from "@eduinteractive/balladui";
import { IconDotsVertical, IconEdit, IconPlus } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { currentTenant } = useTenant();
	const { wikiId } = useLocalSearchParams();
	const navigation = useNavigation();
	const router = useRouter();

	const wikiQuery = useQuery({
		queryKey: ["wiki", currentTenant?._id, wikiId],
		queryFn: () =>
			getWiki({
				tenantId: currentTenant!._id,
				wikiId: wikiId as string,
			}),
		enabled: !!wikiId && !!currentTenant,
	});

	const updateWikiMutation = useMutation({
		mutationFn: updateWiki,
		onSuccess: () => {
			wikiQuery.refetch();
		},
		onError: NotificationHandler.showAxiosError,
	});

	useLayoutEffect(() => {
		if (wikiQuery.data) {
			navigation.setOptions({
				title: wikiQuery.data.title,
				headerRight: () => (
					<HeaderMenu
						options={[
							{
								label: "Bearbeiten",
								value: "edit",
								icon: <IconEdit size={20} />,
							},
						]}
						onSelect={(value) => {
							if (value === "edit")
								router.push(`/knowledge/wiki/${wikiId}/edit`);
						}}
					/>
				),
			});
		}
	}, [wikiQuery.data]);

	if (wikiQuery.isLoading || !wikiQuery.data) {
		return <SVHLoader />;
	}

	const wiki = wikiQuery.data;

	const handleDragEnd = ({ data }: { data: typeof wiki.tableOfContents }) => {
		updateWikiMutation.mutate({
			tenantId: currentTenant!._id,
			wikiId: wikiId as string,
			body: {
				tableOfContents: data,
			},
		});
	};

	return (
		<Box flex={1}>
			<DraggableFlatList
				data={wiki.tableOfContents}
				onDragEnd={handleDragEnd}
				keyExtractor={(item) => item.sectionId || item.title}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
				renderItem={({ item, drag, isActive }) => (
					<ScaleDecorator>
						<TouchableOpacity
							onLongPress={drag}
							disabled={isActive}
							onPress={() =>
								router.push(
									`/knowledge/wiki/${wikiId}/section/${item.sectionId}`
								)
							}
							style={{ backgroundColor: "white" }}
						>
							<Card
								variant="outline"
								bg="white"
								radius={0}
								style={{
									borderTopWidth: 0.25,
									borderBottomWidth: 0.25,
								}}
								p="md"
							>
								<Flex
									direction="row"
									justify="flex-start"
									align="center"
									gap="md"
								>
									<IconDotsVertical
										size={16}
										color="gray"
									/>
									<Text fs="smd">{item.title}</Text>
								</Flex>
							</Card>
						</TouchableOpacity>
					</ScaleDecorator>
				)}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() =>
					router.navigate(`/knowledge/wiki/${wikiId}/section/new` as RelativePathString)
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
						Neues Kapitel
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
