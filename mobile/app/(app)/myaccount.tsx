import { ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard, TextInputProps } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card, Flex, Text, TextInput, Button } from "@eduinteractive/balladui";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../api/Auth";
import { NotificationHandler } from "../../utils/NotificationHandler";

const MyAccountScreen = () => {
	const { authData } = useAuth();
	const contact = authData?.contact as { first_name: string; last_name: string; phone?: string } | undefined;
	const isDfnUser = authData?.authProvider === "DFN_AAI";

	// Password change form state
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordRepeat, setNewPasswordRepeat] = useState("");

    // Password refs
    const oldPasswordRef = useRef<TextInputProps>(null);
    const newPasswordRef = useRef<TextInputProps>(null);
    const newPasswordRepeatRef = useRef<TextInputProps>(null);

	const changePasswordMutation = useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			NotificationHandler.showSuccess("Passwort erfolgreich geändert");
			// Reset form
			setOldPassword("");
			setNewPassword("");
			setNewPasswordRepeat("");
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handlePasswordChange = () => {
		// Validation
		if (!oldPassword.trim()) {
			return NotificationHandler.showError("Bitte gebe dein aktuelles Passwort ein");
		}

		if (!newPassword.trim()) {
			return NotificationHandler.showError("Bitte gebe ein neues Passwort ein");
		}

		if (newPassword.length < 6) {
			return NotificationHandler.showError("Das neue Passwort muss mindestens 6 Zeichen lang sein");
		}

		if (newPassword !== newPasswordRepeat) {
			return NotificationHandler.showError("Die Passwörter stimmen nicht überein");
		}

		if (oldPassword === newPassword) {
			return NotificationHandler.showError(
				"Das neue Passwort muss sich vom aktuellen Passwort unterscheiden"
			);
		}

		// Confirm password change
		Alert.alert("Passwort ändern", "Möchtest du dein Passwort wirklich ändern?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Ändern",
				style: "default",
				onPress: () => {
					changePasswordMutation.mutate({
						body: {
							oldpassword: oldPassword,
							newpassword: newPassword,
						},
					});
				},
			},
		]);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={{ flex: 1 }}
		>
			<ScrollView style={{ flex: 1, backgroundColor: "white" }}>
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
					<Text
						fs="lg"
						fw="bold"
						mb="sm"
						c="gray.8"
					>
						Meine Daten
					</Text>

					<Flex
						direction="column"
						my="md"
					>
						<Text
							fs="sm"
							c="gray.4"
						>
							Vor- und Nachname
						</Text>
						<Text fs="md">
							{contact?.first_name} {contact?.last_name}
						</Text>
					</Flex>

					<Flex
						direction="column"
						my="md"
					>
						<Text
							fs="md"
							c="gray.4"
						>
							E-Mail
						</Text>
						<Text fs="md">{authData?.mail}</Text>
					</Flex>
				</Card>

				{!isDfnUser && (
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
					<Text
						fs="lg"
						fw="bold"
						mb="md"
						c="gray.8"
					>
						Passwort ändern
					</Text>

					<Flex
						direction="column"
						gap="md"
					>
						<TextInput
							size="sm"
							label="Aktuelles Passwort"
							placeholder="Aktuelles Passwort eingeben..."
							value={oldPassword}
							onChangeText={setOldPassword}
							secureTextEntry
							required
							ref={oldPasswordRef as any}
                            onSubmitEditing={() => (newPasswordRef.current as any)?.focus()}
						/>

						<TextInput
							size="sm"
							label="Neues Passwort"
							placeholder="Neues Passwort eingeben..."
							value={newPassword}
							onChangeText={setNewPassword}
							secureTextEntry
							required
							ref={newPasswordRef as any}
                            onSubmitEditing={() => (newPasswordRepeatRef.current as any)?.focus()}
						/>

						<TextInput
							size="sm"
							label="Neues Passwort wiederholen"
							placeholder="Neues Passwort wiederholen..."
							value={newPasswordRepeat}
							onChangeText={setNewPasswordRepeat}
							secureTextEntry
							required
							ref={newPasswordRepeatRef as any}
                            onSubmitEditing={() => Keyboard.dismiss()}
						/>

						<Button
							variant="filled"
							loading={changePasswordMutation.isPending}
							loadingText="Passwort wird geändert..."
							onPress={handlePasswordChange}
							disabled={!oldPassword || !newPassword || !newPasswordRepeat}
						>
							Passwort ändern
						</Button>
					</Flex>
				</Card>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default MyAccountScreen;
