import { getGroupChats, getPrivateChats, GroupMessage, PrivateMessage } from "@/api/Chat";
import { Card, Text, Box, FAB } from "@eduinteractive/balladui";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { Flex } from "@eduinteractive/balladui";
import { useQuery } from "@tanstack/react-query";
import { RelativePathString, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { IconPlus } from "@/assets/icons/Icon";

export default () => {
	const { authData } = useAuth();
	const { userTenants } = useTenant();
	const router = useRouter();
	const [chats, setChats] = useState<(GroupMessage | PrivateMessage)[]>([]);

	const privateChatsQuery = useQuery({
		queryKey: ["privateChats"],
		queryFn: getPrivateChats,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const groupChatsQuery = useQuery({
		queryKey: ["groupChats"],
		queryFn: getGroupChats,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	useFocusEffect(
		useCallback(() => {
			privateChatsQuery.refetch();
			groupChatsQuery.refetch();
		}, [])
	);

	useEffect(() => {
		const sortedChats = [
			...(privateChatsQuery.data || []),
			...(groupChatsQuery.data?.map((group) => ({
				...group,
				groupName: userTenants.find((tenant) => tenant._id === group.tenantId)?.title,
			})) || []),
		].sort((a, b) => {
			return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
		});
		setChats(sortedChats);
	}, [privateChatsQuery.data, groupChatsQuery.data]);

	return (
		<>
			<FlatList
				data={chats}
				keyExtractor={(item) => item._id}
				renderItem={({ item, index }) => (
					<>
						<TouchableOpacity
							onPress={() => {
								if ((item as any).tenantId) {
									router.push(
										`/chat/p2g/${
											(item as any).tenantId
										}` as any
									);
								} else {
									router.push(
										`/chat/p2p/${
											item.authorId === authData?._id
												? (
														item as PrivateMessage
												  ).recipientId
												: item.authorId
										}`
									);
								}
							}}
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
								mih={80}
							>
								<Flex
									direction="column"
									gap="sm"
								>
									<Flex
										direction="row"
										justify="space-between"
										align="center"
									>
										<Text fs="smd">
											{(item as any).tenantId
												? (
														item as GroupMessage & {
															groupName: string;
														}
												  ).groupName
												: (
														item as PrivateMessage & {
															authorName: string;
														}
												  ).authorName}
										</Text>
										<Text
											fs="xs"
											c="gray.5"
										>
											{new Date(
												item.creationDate
											).toLocaleDateString()}
										</Text>
									</Flex>
									<Text
										fs="sm"
										c="gray.5"
										numberOfLines={2}
									>
										{(item as any).tenantId
											? `${(item as any).authorName || "Unbekannte*r Absender*in"}: `
											: ``}
										{item.content}
									</Text>
								</Flex>
							</Card>
						</TouchableOpacity>
					</>
				)}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() => router.navigate("/chat/p2p/new" as RelativePathString)}
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
						Neuer Chat
					</Text>
				</Flex>
			</FAB>
		</>
	);
};
