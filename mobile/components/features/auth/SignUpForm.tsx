import { useState, useRef, Fragment } from "react";
import { Keyboard, Linking, TouchableWithoutFeedback } from "react-native";
import { AuthFormState, MAIL_REGEX, PASSWORD_REGEX } from "@/constants/General";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Button, Checkbox, Flex, Text, TextInput, TextInputProps } from "@eduinteractive/balladui";
import { IconArrowLeft, IconEye, IconEyeOff } from "@/assets/icons/Icon";

export interface onSignUpBody {
	mail: string;
	password: string;
	contact: {
		first_name: string;
		last_name: string;
		phone?: string;
	};
}

interface SignUpFormProps {
	onFormChange: (formState: AuthFormState) => void;
	onSignUp: (body: onSignUpBody) => Promise<void>;
}

const SignUpForm = (props: SignUpFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	// --- State für alle Felder
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [mail, setMail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [terms, setTerms] = useState(false);

	// --- Refs für Fokushandling
	const firstNameRef = useRef<TextInputProps>(null);
	const lastNameRef = useRef<TextInputProps>(null);
	const mailRef = useRef<TextInputProps>(null);
	const phoneRef = useRef<TextInputProps>(null);
	const passwordRef = useRef<TextInputProps>(null);
	const confirmPasswordRef = useRef<TextInputProps>(null);

	const handleSubmit = () => {
		if (!firstName.trim() || !lastName.trim() || !mail.trim() || !password.trim()) {
			return NotificationHandler.showError("Bitte fülle alle notwendigen Felder aus.");
		}

		if (password !== confirmPassword) {
			return NotificationHandler.showError("Die Passwörter stimmen nicht überein.");
		}

		if (!PASSWORD_REGEX.test(password)) {
			return NotificationHandler.showError(
				"Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten"
			);
		}

		if (!MAIL_REGEX.test(mail)) {
			return NotificationHandler.showError("Die E-Mail-Adresse ist nicht gültig");
		}

		if (!terms) {
			return NotificationHandler.showError("Du musst die Nutzungsbedingungen akzeptieren");
		}

		setIsLoading(true);

		props.onSignUp({
			mail,
			password,
			contact: {
				first_name: firstName,
				last_name: lastName,
				phone,
			},
		})
			.then(() => props.onFormChange(AuthFormState.SignIn))
			.finally(() => setIsLoading(false));
	};

	return (
		<Fragment>
			<Flex
				direction="column"
				gap="xl"
			>
				<TextInput
					size="sm"
					label="Vorname"
					placeholder="Vorname eingeben..."
					value={firstName}
					onChangeText={(text) => setFirstName(text)}
					ref={firstNameRef as any}
					onSubmitEditing={() => (lastNameRef.current as any)?.focus()}
					required
				/>

				<TextInput
					size="sm"
					label="Nachname"
					placeholder="Nachname eingeben..."
					value={lastName}
					onChangeText={(text) => setLastName(text)}
					ref={lastNameRef as any}
					onSubmitEditing={() => (mailRef.current as any)?.focus()}
					required
				/>

				<TextInput
					size="sm"
					label="E-Mail-Adresse"
					placeholder="E-Mail-Adresse eingeben..."
					value={mail}
					onChangeText={(text) => setMail(text)}
					ref={mailRef as any}
					onSubmitEditing={() => (phoneRef.current as any)?.focus()}
					required
				/>

				<TextInput
					size="sm"
					label="Telefonnummer"
					placeholder="Telefonnummer eingeben..."
					value={phone}
					onChangeText={(text) => setPhone(text)}
					ref={phoneRef as any}
					onSubmitEditing={() => (passwordRef.current as any)?.focus()}
				/>

				<TextInput
					size="sm"
					label="Passwort"
					placeholder="Passwort eingeben..."
					value={password}
					onChangeText={(text) => setPassword(text)}
					ref={passwordRef as any}
					onSubmitEditing={() => (confirmPasswordRef.current as any)?.focus()}
					required
					secureTextEntry={!showPassword}
					rightSection={
						<TouchableWithoutFeedback
							onPress={() => setShowPassword(!showPassword)}
						>
                            {showPassword ? (
                                <IconEye
                                    size={16}
                                />
                            ) : (
                                <IconEyeOff
                                    size={16}
                                />
                            )}
						</TouchableWithoutFeedback>
					}
				/>

				<TextInput
					size="sm"
					label="Passwort wiederholen"
					placeholder="Passwort wiederholen..."
					value={confirmPassword}
					onChangeText={(text) => setConfirmPassword(text)}
					ref={confirmPasswordRef as any}
					onSubmitEditing={() => Keyboard.dismiss()}
					required
					secureTextEntry={true}
				/>

                <Checkbox
                    label={<Text>Ich habe die <Text fw="bold" c="blue" onPress={() => Linking.openURL("https://univocal.de/nutzungsbedingungen")}>Nutzungsbedingungen</Text> gelesen und stimme diesen zu.</Text> as unknown as string}
                    checked={terms}
                    onChange={(checked) => setTerms(checked)}
                />
			</Flex>

			<Button
				variant="filled"
				loading={isLoading}
				loadingText="Bitte warten..."
				onPress={handleSubmit}
				radius="xs"
			>
				Registrieren
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

export default SignUpForm;
