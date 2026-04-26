import React, { useState } from "react";
import { FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getTenants, joinTenant, deleteUsersGroup, TenantType, Tenant } from "@/api/Tenant";
import { Box, Card, Flex, Text, Button } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import SVHLoader from "@/components/common/SVHLoader";

const OpenTenantsScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
	const { authData, refresh: refreshAuth } = useAuth();

	const tenantsQuery = useQuery({
		queryKey: ["openTenants"],
		queryFn: () =>
			getTenants({
				params: {
					type: TenantType.NETWORK,
					visibility: "PUBLIC",
				},
			}),
	});

	const joinTenantMutation = useMutation({
		mutationFn: joinTenant,
		onSuccess: () => {
            setIsLoading(true);
			tenantsQuery.refetch();
			NotificationHandler.showSuccess(
				"Du bist einer neuen Gruppe beigetreten. Die App wird gleich neu geladen."
			);
			setTimeout(() => {
				refreshAuth();
                setIsLoading(false);
			}, 5000);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const leaveTenantMutation = useMutation({
		mutationFn: deleteUsersGroup,
		onSuccess: () => {
            setIsLoading(true);
			tenantsQuery.refetch();
			NotificationHandler.showSuccess(
				"Du hast die Gruppe erfolgreich verlassen. Die App wird gleich neu geladen."
			);
			setTimeout(() => {
				refreshAuth();
                setIsLoading(false);
			}, 5000);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const isUserInTenant = (tenantId: string) => {
		return authData?.groups.some((group) => group._id === tenantId);
	};

	const handleJoinTenant = (tenantId: string) => {
		joinTenantMutation.mutate({ tenantId });
	};

	const handleLeaveTenant = (tenantId: string) => {
		if (authData?._id) {
			leaveTenantMutation.mutate({
				groupId: tenantId,
				userId: authData._id,
			});
		}
	};

	const renderTenantCard = ({ item: tenant }: { item: Tenant }) => {
		const isJoined = isUserInTenant(tenant._id);

		return (
			<TouchableOpacity>
				<Card
					variant="outline"
					bg="white"
					radius={0}
					style={{ borderTopWidth: 0.25, borderBottomWidth: 0.25 }}
					p="md"
				>
					<Flex
						direction="column"
						gap="sm"
					>
						<Text
							fs="smd"
							fw="bold"
						>
							{tenant.title}
						</Text>
						{tenant.description && (
							<Text
								fs="sm"
								c="gray.5"
							>
								{tenant.description}
							</Text>
						)}
						<Flex
							direction="row"
							justify="flex-end"
						>
							{isJoined ? (
								<Button
									variant="outline"
									size="md"
									onPress={() => handleLeaveTenant(tenant._id)}
									loading={leaveTenantMutation.isPending || isLoading}
									style={{ borderWidth: 1 }}
								>
									{leaveTenantMutation.isPending
										? "Verlasse..."
										: "Verlassen"}
								</Button>
							) : (
								<Button
									variant="filled"
									size="md"
									onPress={() => handleJoinTenant(tenant._id)}
									loading={joinTenantMutation.isPending || isLoading}
								>
									{joinTenantMutation.isPending
										? "Trete bei..."
										: "Beitreten"}
								</Button>
							)}
						</Flex>
					</Flex>
				</Card>
			</TouchableOpacity>
		);
	};

	if (tenantsQuery.isLoading) {
		return <SVHLoader />;
	}

	return (
		<Box
			flex={1}
			bg="white"
		>
			<FlatList
				data={tenantsQuery.data || []}
				renderItem={renderTenantCard}
				keyExtractor={(item) => item._id}
				refreshControl={
					<RefreshControl
						refreshing={tenantsQuery.isRefetching}
						onRefresh={() => tenantsQuery.refetch()}
					/>
				}
				ListEmptyComponent={
					<Flex
						direction="column"
						justify="center"
						align="center"
						style={{ flex: 1, padding: 32 }}
					>
						<Text
							fs="lg"
							c="gray.6"
							style={{ textAlign: "center" }}
						>
							Keine offenen Gruppen verfügbar
						</Text>
						<Text
							fs="sm"
							c="gray.5"
							style={{ textAlign: "center", marginTop: 8 }}
						>
							Ziehe nach unten, um zu aktualisieren
						</Text>
					</Flex>
				}
				showsVerticalScrollIndicator={false}
			/>
		</Box>
	);
};

export default OpenTenantsScreen;
