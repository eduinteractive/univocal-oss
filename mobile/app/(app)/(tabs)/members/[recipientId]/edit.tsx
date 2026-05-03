import React, { useState, useLayoutEffect, useEffect } from "react";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenant, TenantUser, updateUsersGroup, deleteUsersGroup } from "@/api/Tenant";
import { useTenant } from "@/context/TenantContext";
import { KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Card, Flex, Text, Button, Select, TextInput, applyColor } from "@eduinteractive/balladui";
import { GROUP_PERMISSION_OPTIONS } from "@/api/Auth";
import UVCLoader from "@/components/common/UVCLoader";
import { IconTrash } from "@/assets/icons/Icon";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const { recipientId } = useLocalSearchParams<{ recipientId: string }>();

	// Form state
	const [permissionLevel, setPermissionLevel] = useState<number>(0);
	const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);

	// Fetch tenant data to get user details
	const tenantQuery = useQuery({
		queryKey: ["tenant", currentTenant?._id],
		queryFn: () => getTenant({ id: currentTenant?._id }),
	});

	// Update user state when data is loaded
	useEffect(() => {
		if (tenantQuery.data) {
			const user = tenantQuery.data.users.find((u: TenantUser) => u._id === recipientId);
			if (user) {
				setCurrentUser(user);
				setPermissionLevel(user.group_permission);
			}
		}
	}, [tenantQuery.data, recipientId]);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Mitglied bearbeiten",
			headerRight: () => (
				<Flex
					direction="row"
					gap="sm"
				>
					<Button
						variant="subtle"
						size="sm"
						onPress={handleDelete}
					>
						<IconTrash
							color={applyColor("red")}
							size={20}
						/>
					</Button>
				</Flex>
			),
		});
	}, [navigation, currentUser]);

	const updatePermissionMutation = useMutation({
		mutationFn: updateUsersGroup,
		onSuccess: () => {
			NotificationHandler.showSuccess("Berechtigung erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["tenant", currentTenant?._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = () => {
		if (!currentUser) return;

		if (permissionLevel === currentUser.group_permission) {
			return NotificationHandler.showError("Keine Änderungen vorgenommen");
		}

		updatePermissionMutation.mutate({
			groupId: currentUser.group_id,
			body: {
				userId: currentUser._id,
				permissionLevel,
			},
		});
	};

	const handleDelete = () => {
		Alert.alert(
			"Mitglied entfernen",
			`Möchtest du ${currentUser?.firstName} ${currentUser?.lastName} wirklich aus der Organisation entfernen?`,
			[
				{
					text: "Abbrechen",
					style: "cancel",
				},
				{
					text: "Entfernen",
					style: "destructive",
					onPress: async () => {
						if (!currentUser) return;
						await deleteUsersGroup({
							groupId: currentUser.group_id,
							userId: currentUser._id,
						});
						NotificationHandler.showSuccess("Mitglied erfolgreich entfernt");
						queryClient.invalidateQueries({
							queryKey: ["tenant", currentTenant?._id],
						});
						router.back();
					},
				},
			]
		);
	};

	const getPermissionOptions = () =>
		GROUP_PERMISSION_OPTIONS.map(({ value, label }) => ({
			label,
			value: String(value),
		}));

	if (tenantQuery.isLoading || !currentUser) {
		return <UVCLoader />;
	}

	if (!currentUser) {
		return (
			<Card
				p="md"
				m="md"
			>
				<Text
					fs="sm"
					c="red.6"
				>
					Mitglied nicht gefunden
				</Text>
			</Card>
		);
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, flexGrow: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
		>
			<ScrollView
				style={{ flex: 1, backgroundColor: "white" }}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<Flex
					direction="column"
					gap="md"
					p="md"
				>
					{/* User Info */}
					<Flex
						direction="column"
						gap="sm"
					>
						<Text
							fs="lg"
							fw="bold"
							c="gray.8"
						>
							{currentUser.firstName} {currentUser.lastName}
						</Text>
					</Flex>

					<TextInput
						size="sm"
						label="Vor- und Nachname"
						value={currentUser.firstName + " " + currentUser.lastName}
						disabled={true}
					/>

					{/* Permission Selection */}
					<Select
						label="Neue Berechtigung"
						placeholder="Berechtigung auswählen..."
						size="sm"
						value={permissionLevel.toString()}
						options={getPermissionOptions()}
						onChange={(value) => setPermissionLevel(parseInt(value))}
					/>

					<Text
						fs="sm"
						c="gray.5"
						mt="sm"
					>
						Die Änderung der Berechtigung wird sofort wirksam. Das Mitglied erhält
						entsprechend neue oder eingeschränkte Zugriffsrechte.
					</Text>

					{/* Action Buttons */}
					<Flex
						direction="column"
						gap="sm"
						mt="md"
					>
						<Button
							variant="filled"
							loading={updatePermissionMutation.isPending}
							loadingText="Berechtigung wird aktualisiert..."
							onPress={handleSubmit}
							disabled={permissionLevel === currentUser.group_permission}
						>
							Berechtigung aktualisieren
						</Button>
					</Flex>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
