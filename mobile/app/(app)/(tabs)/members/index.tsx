import React, { useState } from "react";
import { FlatList, TouchableOpacity, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenant, getInvitationsByTenant, TenantInvitation, deleteTenantInvitation } from "../../../../api/Tenant";
import { useTenant } from "../../../../context/TenantContext";
import { TenantUser } from "../../../../api/Tenant";
import { RelativePathString, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import UVCLoader from "@/components/common/UVCLoader";
import { ActionSheet, Box, Card, FAB, Flex, Text } from "@eduinteractive/balladui";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { IconEdit, IconPlus } from "@/assets/icons/Icon";

export default () => {
	const { authData } = useAuth();
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();

	// ActionSheet state
	const [selectedItem, setSelectedItem] = useState<{ id: string; type: "member" | "invitation" } | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const tenantMemberQuery = useQuery({
		queryKey: ["tenant", currentTenant?._id],
		queryFn: () => getTenant({ id: currentTenant?._id }),
	});

	const invitationsQuery = useQuery({
		queryKey: ["tenantInvitations", currentTenant?._id],
		queryFn: () => getInvitationsByTenant({ tenantId: currentTenant?._id || "" }),
		enabled: !!currentTenant?._id,
	});

	const deleteInvitationMutation = useMutation({
		mutationFn: deleteTenantInvitation,
		onSuccess: () => {
			NotificationHandler.showSuccess("Einladung erfolgreich gelöscht");
			queryClient.invalidateQueries({ queryKey: ["tenantInvitations", currentTenant?._id] });
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleLongPress = (itemId: string, type: "member" | "invitation") => {
		if (itemId === authData?._id) return;
		setSelectedItem({ id: itemId, type });
		setIsOpen(true);
	};

	const handleDeleteInvitation = () => {
		if (selectedItem && selectedItem.type === "invitation") {
			Alert.alert("Einladung löschen", "Möchtest du diese Einladung wirklich löschen?", [
				{
					text: "Abbrechen",
					style: "cancel",
				},
				{
					text: "Löschen",
					style: "destructive",
					onPress: () => {
						deleteInvitationMutation.mutate({
							tenantId: currentTenant!._id!,
							invitationId: selectedItem.id,
						});
						setIsOpen(false);
						setSelectedItem(null);
					},
				},
			]);
		}
	};

	const handleEditMember = () => {
		if (selectedItem && selectedItem.type === "member") {
			// Navigate to member edit page (you can implement this later)
			router.push(`/members/${selectedItem.id}/edit` as RelativePathString);
			setIsOpen(false);
			setSelectedItem(null);
		}
	};

	const renderMemberItem = ({ item }: { item: TenantUser }) => (
		<TouchableOpacity
			onPress={() => authData?._id !== item._id && router.navigate(`/members/${item._id}/p2p`)}
			onLongPress={() => handleLongPress(item._id, "member")}
			delayLongPress={500}
		>
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
					<Box className="flex-1">
						<Text
							fs="smd"
							fw="bold"
						>
							{item.firstName} {item.lastName}
						</Text>
					</Box>
				</Flex>
			</Card>
		</TouchableOpacity>
	);

	const renderInvitationItem = ({ item }: { item: TenantInvitation }) => (
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
				<Box className="flex-1">
					<Text
						fs="sm"
						fw="bold"
					>
						{item.mail}
					</Text>
					<Text
						fs="xs"
						c="gray.5"
					>
						Eingeladen am {new Date(item.date).toLocaleDateString()}
					</Text>
				</Box>
				<Text
					fs="xs"
					c="orange.6"
					fw="bold"
				>
					Ausstehend
				</Text>
			</Flex>
		</Card>
	);

	if (!tenantMemberQuery.data) {
		return <UVCLoader />;
	}

	return (
		<>
			<Box
				flex={1}
				bg="white"
			>
				<FlatList
					data={tenantMemberQuery.data.users || []}
					renderItem={renderMemberItem}
					keyExtractor={(item) => item._id}
					ListFooterComponent={
						invitationsQuery.data && invitationsQuery.data.length > 0 ? (
							<Box>
								<Text
									fs="sm"
									fw="bold"
									p="md"
									bg="primary.1"
								>
									Ausstehende Einladungen
								</Text>
								{invitationsQuery.data.map((invitation) => (
									<Box key={invitation._id}>
										{renderInvitationItem({
											item: invitation,
										})}
									</Box>
								))}
							</Box>
						) : null
					}
				/>
				<FAB
					p="smd"
					px="md"
					color="dark"
					onPress={() => router.navigate("/members/new" as RelativePathString)}
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
							Mitglied einladen
						</Text>
					</Flex>
				</FAB>
			</Box>

			<ActionSheet
				visible={isOpen}
				onClose={() => setIsOpen(false)}
				title="Aktion"
				options={[
					{
						label: "Bearbeiten",
						value: "edit",
						icon: <IconEdit size={20} />,
					},
				]}
				onSelect={(option) => {
					if (option === "edit") {
						handleEditMember();
					} else if (option === "delete") {
						handleDeleteInvitation();
					}
				}}
			/>
		</>
	);
};
