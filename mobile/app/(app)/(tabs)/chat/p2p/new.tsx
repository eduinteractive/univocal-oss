import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { getUsersInSameGroups, User } from "@/api/User";
import SVHLoader from "@/components/common/SVHLoader";
import { Card, Text, Box } from "@eduinteractive/balladui";
import { Flex } from "@eduinteractive/balladui";

export default function NewP2PChatScreen() {
	const router = useRouter();
	const { authData } = useAuth();

	const usersQuery = useQuery({
		queryKey: ["usersInSameGroup"],
		queryFn: getUsersInSameGroups,
	});

	const renderUserItem = ({ item }: { item: Partial<User> }) => {
		if (!item._id || item._id === authData?._id) return null; // Don't show current user or invalid users

		return (
			<TouchableOpacity onPress={() => router.push(`/chat/p2p/${item._id}`)} style={{ backgroundColor: "white" }}>
				<Card
					variant="outline"
					bg="white"
					radius={0}
					style={{ borderTopWidth: 0.25, borderBottomWidth: 0.25 }}
					p="md"
				>
					<Flex
						direction="row"
						justify="space-between"
						align="center"
					>
						<Box flex={1}>
							<Text
								fs="smd"
							>
								{item.firstName} {item.lastName}
							</Text>
						</Box>
					</Flex>
				</Card>
			</TouchableOpacity>
		);
	};

	if (usersQuery.isLoading) {
		return <SVHLoader />;
	}

	return (
		<FlatList
			data={usersQuery.data?.sort((a, b) => a.firstName?.localeCompare(b.firstName || "") || 0)}
			keyExtractor={(item) => item._id as string}
			renderItem={renderUserItem}
		/>
	);
}
