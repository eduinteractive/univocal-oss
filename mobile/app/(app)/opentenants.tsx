import React, { useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
	getTenants,
	joinTenant,
	deleteUsersGroup,
	getUserTenantRequests,
	createTenantJoinRequest,
	cancelUserTenantRequest,
	Tenant,
	TenantRequest,
} from "@/api/Tenant";
import { Box, Card, Flex, Text, Button } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCLoader from "@/components/common/UVCLoader";

const findPendingRequest = (
	joinRequests: (TenantRequest & { tenant: Tenant })[] | undefined,
	tenantId: string
) =>
	joinRequests?.find(
		(r) =>
			typeof r.tenant === "object" &&
			r.tenant !== null &&
			"_id" in r.tenant &&
			r.tenant._id === tenantId
	);

const OpenTenantsScreen = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { authData, refresh: refreshAuth } = useAuth();

	const myJoinRequestsQuery = useQuery({
		queryKey: ["userTenantJoinRequests"],
		queryFn: getUserTenantRequests,
		enabled: Boolean(authData),
	});

	const tenantsQuery = useQuery({
		queryKey: ["openTenants"],
		queryFn: () =>
			getTenants({
				params: {
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
			}, 2000);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const requestJoinMutation = useMutation({
		mutationFn: createTenantJoinRequest,
		onSuccess: () => {
			myJoinRequestsQuery.refetch();
			NotificationHandler.showSuccess(
				"Deine Beitrittsanfrage wurde gesendet. Die Gruppenverwaltung wird sie prüfen."
			);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const withdrawRequestMutation = useMutation({
		mutationFn: cancelUserTenantRequest,
		onSuccess: () => {
			myJoinRequestsQuery.refetch();
			NotificationHandler.showSuccess("Anfrage wurde zurückgezogen.");
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
			}, 2000);
		},
		onError: NotificationHandler.showAxiosError,
	});

	const isUserInTenant = (tenantId: string) => {
		return authData?.groups.some((group) => group._id === tenantId);
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
		const pendingRequest = findPendingRequest(myJoinRequestsQuery.data, tenant._id);

		const renderActionButton = () => {
			if (isJoined) {
				return (
					<Button
						variant="outline"
						size="md"
						onPress={() => handleLeaveTenant(tenant._id)}
						loading={leaveTenantMutation.isPending || isLoading}
						style={{ borderWidth: 1 }}
					>
						{leaveTenantMutation.isPending ? "Verlasse..." : "Verlassen"}
					</Button>
				);
			}

			if (tenant.visibility === "PUBLIC") {
				return (
					<Button
						variant="filled"
						size="md"
						onPress={() => joinTenantMutation.mutate({ tenantId: tenant._id })}
						loading={joinTenantMutation.isPending || isLoading}
					>
						{joinTenantMutation.isPending ? "Trete bei..." : "Beitreten"}
					</Button>
				);
			}

			if (tenant.visibility === "ON_REQUEST") {
				if (pendingRequest) {
					return (
						<Button
							variant="outline"
							size="md"
							onPress={() =>
								withdrawRequestMutation.mutate({
									requestId: pendingRequest._id,
								})
							}
							loading={withdrawRequestMutation.isPending}
							style={{ borderWidth: 1 }}
						>
							Anfrage zurückziehen
						</Button>
					);
				}

				return (
					<Button
						variant="filled"
						size="md"
						onPress={() =>
							requestJoinMutation.mutate({ tenantId: tenant._id })
						}
						loading={requestJoinMutation.isPending}
					>
						Beitritt anfragen
					</Button>
				);
			}

			return null;
		};

		return (
			<Card
				variant="outline"
				bg="white"
				radius={0}
				style={{ borderTopWidth: 0.25, borderBottomWidth: 0.25 }}
				p="md"
			>
				<Flex direction="column" gap="sm">
					<Text fs="smd" fw="bold">
						{tenant.title}
					</Text>
					{tenant.description && (
						<Text fs="sm" c="gray.5">
							{tenant.description}
						</Text>
					)}
					<Flex direction="row" justify="flex-end">
						{renderActionButton()}
					</Flex>
				</Flex>
			</Card>
		);
	};

	if (tenantsQuery.isLoading) {
		return <UVCLoader />;
	}

	return (
		<Box flex={1} bg="white">
			<FlatList
				data={tenantsQuery.data || []}
				renderItem={renderTenantCard}
				keyExtractor={(item) => item._id}
				refreshControl={
					<RefreshControl
						refreshing={tenantsQuery.isRefetching}
						onRefresh={() => {
							tenantsQuery.refetch();
							myJoinRequestsQuery.refetch();
						}}
					/>
				}
				ListEmptyComponent={
					<Flex
						direction="column"
						justify="center"
						align="center"
						style={{ flex: 1, padding: 32 }}
					>
						<Text fs="lg" c="gray.6" style={{ textAlign: "center" }}>
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
