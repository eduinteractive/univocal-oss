import { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { RelativePathString, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWiki, getWikis } from "@/api/Wiki";
import SVHMetaCards from "@/components/common/SVHMetaCards";
import { getContactGroups } from "@/api/Contact";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Box, Button, Flex, Text } from "@eduinteractive/balladui";
import { FAB } from "@eduinteractive/balladui";
import { IconPlus } from "@/assets/icons/Icon";

const KNOWLEDGE_NAVIGATION_ITEMS = [
	{
		title: "Wikis",
	},
	{
		title: "Kontaktgruppen",
	},
];

const KnowledgeScreen = () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [activeTab, setActiveTab] = useState("Wikis");

	const wikisQuery = useQuery({
		queryKey: ["wikis", currentTenant?._id, {}],
		queryFn: () =>
			getWikis({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const deleteWikiMutation = useMutation({
		mutationFn: deleteWiki,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wikis"] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const contactGroupsQuery = useQuery({
		queryKey: ["contactGroups", currentTenant?._id, {}],
		queryFn: () =>
			getContactGroups({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return (
		<Box flex={1}>
			<Flex
				direction="row"
				px="sm"
				py="xs"
                pt="sm"
                gap="sm"
                justify="space-between"
			>
				{KNOWLEDGE_NAVIGATION_ITEMS.map((item) => {
					const isActive = activeTab === item.title;

					return (
						<Button
                            color="dark"
							key={item.title}
							variant={isActive ? "filled" : "light"}
							onPress={() => setActiveTab(item.title)}
                            w="48%"
                            size="md"
						>
							{item.title}
						</Button>
					);
				})}
			</Flex>
			{activeTab === "Wikis" && (
				<SVHMetaCards
					permissionPrefix="knowledge"
					data={wikisQuery.data || []}
					onOpen={(wikiId) =>
						router.navigate(`/knowledge/wiki/${wikiId}` as RelativePathString)
					}
					onDelete={(wikiId) => {
						deleteWikiMutation.mutate({
							wikiId,
							tenantId: currentTenant!._id,
						});
					}}
				/>
			)}
			{activeTab === "Kontaktgruppen" && (
				<SVHMetaCards
					permissionPrefix="knowledge"
					data={contactGroupsQuery.data || []}
					onOpen={(contactGroupId) =>
						router.navigate(
							`/knowledge/contactgroup/${contactGroupId}` as RelativePathString
						)
					}
				/>
			)}
			{activeTab === "Wikis" && (
				<FAB
					p="smd"
					px="md"
					color="dark"
					onPress={() => router.navigate("/knowledge/wiki/new" as RelativePathString)}
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
			)}
			{activeTab === "Kontaktgruppen" && (
				<FAB
					p="smd"
					px="md"
					color="dark"
					onPress={() =>
						router.navigate("/knowledge/contactgroup/new" as RelativePathString)
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
							Neue Kontaktgruppe
						</Text>
					</Flex>
				</FAB>
			)}
		</Box>
	);
};

export default KnowledgeScreen;
