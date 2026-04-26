import { useState, useRef, Fragment } from "react";
import { Keyboard, TextInputProps } from "react-native";
import { AuthFormState, MAIL_REGEX } from "@/constants/General";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Button, Flex, Text, TextInput } from "@eduinteractive/balladui";
import { IconArrowLeft } from "@/assets/icons/Icon";

interface ForgetPasswordFormProps {
	onFormChange: (formState: AuthFormState) => void;
	onForgetPassword: (mail: string) => Promise<void>;
}

const ForgetPasswordForm = (props: ForgetPasswordFormProps) => {
	const [isLoading, setIsLoading] = useState(false);

	// --- State für E-Mail und Passwort
	const [mail, setMail] = useState("");

	// --- Refs für Fokushandling (optional)
	const mailRef = useRef<TextInputProps>(null);

	const handleSubmit = () => {
		if (!MAIL_REGEX.test(mail)) {
			return NotificationHandler.showError("Bitte gib eine gültige E-Mail-Adresse ein.");
		}

		setIsLoading(true);
		props.onForgetPassword(mail)
			.then(() => props.onFormChange(AuthFormState.SignIn))
			.finally(() => setIsLoading(false));
	};

	return (
		<Fragment>
			<TextInput
				size="sm"
				label="E-Mail-Adresse"
                placeholder="E-Mail-Adresse eingeben"
				value={mail}
				onChangeText={(text) => setMail(text)}
				ref={mailRef as any}
				onSubmitEditing={() => Keyboard.dismiss()}
				required
			/>

			<Button
				variant="filled"
				loading={isLoading}
				loadingText="Bitte warten..."
				onPress={handleSubmit}
				radius="xs"
			>
				Absenden
			</Button>

			<Flex
				direction="row"
				align="flex-start"
				gap="xs"
			>
				<Button
					variant="subtle"
					size="xs"
					onPress={() => props.onFormChange(AuthFormState.SignIn)}
				>
					<IconArrowLeft
						size={16}
					/>
					<Text
						c="gray.8"
						fs={12}
					>
						Zurück zur Anmeldung
					</Text>
				</Button>
			</Flex>
		</Fragment>
	);
};

export default ForgetPasswordForm;
