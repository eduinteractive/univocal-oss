import React, { useState, useLayoutEffect, useEffect } from "react";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenant, TenantUser, updateUsersGroup, deleteUsersGroup, updateUserBadges } from "@/api/Tenant";
import { useTenant } from "@/context/TenantContext";
import { KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Card, Flex, Text, Button, Select, TextInput, applyColor } from "@eduinteractive/balladui";
import { GROUP_PERMISSION_LEVEL, GROUP_PERMISSION_OPTIONS } from "@/api/Auth";
import UVCLoader from "@/components/common/UVCLoader";
import { IconTrash } from "@/assets/icons/Icon";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const { recipientId } = useLocalSearchParams<{ recipientId: string }>();

	const isAdmin = currentTenant?.permissionLevel === GROUP_PERMISSION_LEVEL.ADMIN;
	const canAssignBadges =
		currentTenant?.permissionLevel === GROUP_PERMISSION_LEVEL.MODERATOR || isAdmin;

	// Form state
	const [permissionLevel, setPermissionLevel] = useState<number>(0);
	const [badges, setBadges] = useState<string[]>([]);
	const [badgeDraft, setBadgeDraft] = useState("");
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
				setBadges(user.badges ?? []);
			}
		}
	}, [tenantQuery.data, recipientId]);

	useEffect(() => {
		if (currentTenant && !canAssignBadges) {
			router.back();
		}
	}, [currentTenant, canAssignBadges, router]);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Mitglied bearbeiten",
			headerRight: () =>
				isAdmin ? (
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
				) : null,
		});
	}, [navigation, currentUser, isAdmin]);

	const badgesChanged = (next: string[], previous: string[] = []) =>
		next.length !== previous.length || next.some((badge, index) => badge !== previous[index]);

	const saveMutation = useMutation({
		mutationFn: async () => {
			if (!currentUser) return;
			if (isAdmin && permissionLevel !== currentUser.group_permission) {
				await updateUsersGroup({
					groupId: currentUser.group_id,
					body: {
						userId: currentUser._id,
						permissionLevel,
					},
				});
			}
			if (badgesChanged(badges, currentUser.badges)) {
				await updateUserBadges({
					groupId: currentUser.group_id,
					body: {
						userId: currentUser._id,
						badges,
					},
				});
			}
		},
		onSuccess: () => {
			NotificationHandler.showSuccess("Mitglied erfolgreich bearbeitet");
			queryClient.invalidateQueries({ queryKey: ["tenant", currentTenant?._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const addBadge = () => {
		const label = badgeDraft.trim().replace(/\s+/g, " ");
		if (!label) return;
		if (label.length > 40) {
			NotificationHandler.showError("Eine Funktion darf höchstens 40 Zeichen lang sein.");
			return;
		}
		if (badges.some((badge) => badge.toLowerCase() === label.toLowerCase())) {
			setBadgeDraft("");
			return;
		}
		if (badges.length >= 8) {
			NotificationHandler.showError("Es sind höchstens 8 Funktionen erlaubt.");
			return;
		}
		setBadges((current) => [...current, label]);
		setBadgeDraft("");
	};

	const handleSubmit = () => {
		if (!currentUser) return;

		const permissionChanged = isAdmin && permissionLevel !== currentUser.group_permission;
		if (!permissionChanged && !badgesChanged(badges, currentUser.badges)) {
			return NotificationHandler.showError("Keine Änderungen vorgenommen");
		}

		saveMutation.mutate();
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

	if (tenantQuery.isLoading || !currentUser || (currentTenant && !canAssignBadges)) {
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

					{isAdmin && (
						<>
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
							>
								Die Änderung der Berechtigung wird sofort wirksam. Das Mitglied erhält
								entsprechend neue oder eingeschränkte Zugriffsrechte.
							</Text>
						</>
					)}

					<Flex direction="column" gap="sm">
						<Text fs="sm" fw="bold">
							Funktion
						</Text>
						<Text fs="xs" c="gray.5">
							Sichtbar für alle Mitglieder. Höchstens 8 Funktionen, jeweils bis zu 40 Zeichen.
						</Text>
						{badges.length > 0 && (
							<Flex direction="row" wrap="wrap" gap="xs">
								{badges.map((badge) => (
									<Flex
										key={badge}
										direction="row"
										align="center"
										gap="xs"
										bg="primary.1"
										px="sm"
										py="xs"
										style={{ borderRadius: 999 }}
									>
										<Text fs="xs">{badge}</Text>
										<Button
											variant="subtle"
											size="sm"
											onPress={() =>
												setBadges((current) => current.filter((item) => item !== badge))
											}
										>
											Entfernen
										</Button>
									</Flex>
								))}
							</Flex>
						)}
						<TextInput
							size="sm"
							label="Funktion hinzufügen"
							placeholder="Zum Beispiel Sprecher*in"
							value={badgeDraft}
							onChangeText={setBadgeDraft}
							onSubmitEditing={addBadge}
							maxLength={40}
						/>
						<Button variant="outline" onPress={addBadge}>
							Funktion hinzufügen
						</Button>
					</Flex>

					<Flex
						direction="column"
						gap="sm"
						mt="md"
					>
						<Button
							variant="filled"
							loading={saveMutation.isPending}
							loadingText="Wird gespeichert..."
							onPress={handleSubmit}
							disabled={
								!(isAdmin && permissionLevel !== currentUser.group_permission) &&
								!badgesChanged(badges, currentUser.badges)
							}
						>
							Speichern
						</Button>
					</Flex>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
