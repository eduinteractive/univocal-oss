import { useRouter, useNavigation } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvitation } from "@/api/Tenant";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, TextInputProps } from "react-native";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Card, Flex, Text, TextInput, Button, Select } from "@eduinteractive/balladui";
import { SV_PERMISSION_LEVEL, NETWORK_PERMISSION_LEVEL, SSR_PERMISSION_LEVEL } from "@/api/Auth";
import { TenantType } from "@/api/Tenant";

// Permission level strings for different tenant types
const SV_PERMISSION_STRINGS = {
	[SV_PERMISSION_LEVEL.GUEST]: "Gast",
	[SV_PERMISSION_LEVEL.CLASS_SPEAKER]: "Klassensprecher*in",
	[SV_PERMISSION_LEVEL.SV_MEMBER]: "SV-Mitglied",
	[SV_PERMISSION_LEVEL.SV_BOARD]: "SV-Vorstand",
	[SV_PERMISSION_LEVEL.SV_TEACHER]: "SV-Lehrer*in",
	[SV_PERMISSION_LEVEL.SV_ADMIN]: "SV-Administrator*in",
};

const NETWORK_PERMISSION_STRINGS = {
	[NETWORK_PERMISSION_LEVEL.GUEST]: "Gast",
	[NETWORK_PERMISSION_LEVEL.NETWORK_MEMBER]: "Netzwerk-Mitglied",
	[NETWORK_PERMISSION_LEVEL.NETWORK_ADMIN]: "Netzwerk-Administrator*in",
};

const SSR_PERMISSION_STRINGS = {
	[SSR_PERMISSION_LEVEL.GUEST]: "Gast",
	[SSR_PERMISSION_LEVEL.SSR_MEMBER]: "SSR-Mitglied",
	[SSR_PERMISSION_LEVEL.SSR_BOARD]: "SSR-Vorstand",
	[SSR_PERMISSION_LEVEL.SSR_ADMIN]: "SSR-Administrator*in",
};

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const navigation = useNavigation();

	// Form state
	const [email, setEmail] = useState("");
	const [permissionLevel, setPermissionLevel] = useState<number>(0);

	// Refs for form navigation
	const emailRef = useRef<TextInputProps>(null);

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Mitglied einladen",
		});
	}, [navigation]);

	const createInvitationMutation = useMutation({
		mutationFn: createInvitation,
		onSuccess: () => {
			NotificationHandler.showSuccess("Einladung erfolgreich versendet");
			queryClient.invalidateQueries({ queryKey: ["tenant", currentTenant?._id] });
			queryClient.invalidateQueries({ queryKey: ["tenantInvitations", currentTenant?._id] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = () => {
		// Validation
		if (!email.trim()) {
			return NotificationHandler.showError("Bitte gebe eine E-Mail-Adresse ein");
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			return NotificationHandler.showError("Bitte gebe eine gültige E-Mail-Adresse ein");
		}

		if (permissionLevel === undefined || permissionLevel < 0) {
			return NotificationHandler.showError("Bitte wähle eine Berechtigung aus");
		}

		createInvitationMutation.mutate({
			body: {
				tenantId: currentTenant!.tenant!._id,
				mail: email.trim(),
				permissionLevel,
			},
		});
	};

	// Get permission options based on tenant type
	const getPermissionOptions = () => {
		if (!currentTenant?.tenant) return [];

		switch (currentTenant.tenant.type) {
			case TenantType.SV:
				return Object.entries(SV_PERMISSION_STRINGS).map(([key, label]) => ({
					label,
					value: key,
				}));
			case TenantType.NETWORK:
				return Object.entries(NETWORK_PERMISSION_STRINGS).map(([key, label]) => ({
					label,
					value: key,
				}));
			case TenantType.SSR:
				return Object.entries(SSR_PERMISSION_STRINGS).map(([key, label]) => ({
					label,
					value: key,
				}));
			default:
				return [];
		}
	};

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
				<Card
					variant="outline"
					color="gray.3"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
					p="md"
				>
					<Flex
						direction="column"
						gap="md"
					>
						<TextInput
							size="sm"
							label="E-Mail-Adresse"
							placeholder="E-Mail-Adresse eingeben..."
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							ref={emailRef as any}
							onSubmitEditing={() => Keyboard.dismiss()}
							required
						/>

						<Select
							label="Berechtigung"
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
							Die Person erhält eine E-Mail mit einem Einladungslink und kann sich dann registrieren oder anmelden.
						</Text>

						<Button
							variant="filled"
							loading={createInvitationMutation.isPending}
							loadingText="Einladung wird versendet..."
							onPress={handleSubmit}
							disabled={!email.trim() || permissionLevel < 0}
							mt="md"
						>
							Einladung senden
						</Button>
					</Flex>
				</Card>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
