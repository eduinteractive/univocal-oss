import { FlatList, RefreshControl } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	getUserTenantInvitations,
	Tenant,
	TenantInvitation,
	acceptInvitation,
	declineInvitation,
} from "@/api/Tenant";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Flex, Text } from "@eduinteractive/balladui";
import UVCLoader from "@/components/common/UVCLoader";

const InvitationsScreen = () => {
	const { refresh } = useAuth();

	const invitationsQuery = useQuery({
		queryKey: ["userInvitations"],
		queryFn: () => getUserTenantInvitations(),
	});

	const acceptInvitationMutation = useMutation({
		mutationFn: (invitationId: string) => acceptInvitation({ invitationId }),
		onSuccess: async () => {
			try {
				await refresh();
				NotificationHandler.showSuccess("Du wurdest erfolgreich zur Gruppe hinzugefügt");
			} catch (err) {
				NotificationHandler.showAxiosError(err as any);
			}
		},
		onError: NotificationHandler.showAxiosError,
	});

	const declineInvitationMutation = useMutation({
		mutationFn: (invitationId: string) => declineInvitation({ invitationId }),
		onSuccess: async () => {
			try {
				await invitationsQuery.refetch();
				NotificationHandler.showSuccess("Die Einladung wurde erfolgreich abgelehnt");
			} catch (error) {
				NotificationHandler.showAxiosError(error as any);
			}
		},
		onError: NotificationHandler.showAxiosError,
	});

	const renderInvitationItem = ({ item }: { item: TenantInvitation & { tenant: Tenant } }) => (
		<Card
			variant="outline"
            radius={0}
            style={{ borderTopWidth: 0 }}
		>
			<Flex
				direction="row"
				justify="space-between"
				align="center"
				p="xs"
			>
					<Text
						fs="sm"
						fw="bold"
                        flex={1}
					>
						{item.tenant.title}
					</Text>
				<Flex
					direction="row"
					justify="flex-end"
					align="center"
                    gap="sm"
				>
					<Button
						variant="filled"
						color="red"
                        fs="xs"
                        style={{ paddingVertical: 10 }}
						onPress={() => declineInvitationMutation.mutate(item._id)}
						loading={declineInvitationMutation.isPending}
					>
						Ablehnen
					</Button>
					<Button
						variant="filled"
						color="green"
                        fs="xs"
                        style={{ paddingVertical: 10 }}
						onPress={() => acceptInvitationMutation.mutate(item._id)}
						loading={acceptInvitationMutation.isPending}
					>
						Akzeptieren
					</Button>
				</Flex>
			</Flex>
		</Card>
	);

	if (!invitationsQuery.data) {
		return <UVCLoader />;
	}

	return (
		<FlatList
			data={invitationsQuery.data}
			renderItem={renderInvitationItem}
			refreshControl={
				<RefreshControl
					refreshing={invitationsQuery.isRefetching}
					onRefresh={invitationsQuery.refetch}
				/>
			}
			keyExtractor={(item) => item._id}
			style={{ backgroundColor: "white" }}
			ListEmptyComponent={
				invitationsQuery.data && invitationsQuery.data.length === 0 ? (
					<Flex
						direction="column"
						justify="center"
						align="center"
						p="sm"
					>
						<Text
							fs="sm"
							className="text-gray-500"
						>
							Keine Einladungen vorhanden
						</Text>
					</Flex>
				) : null
			}
		/>
	);
};

export default InvitationsScreen;
