import { useState, useRef, Fragment } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { AuthFormState, MAIL_REGEX } from "@/constants/General";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Button, Flex, Text, TextInput, TextInputProps } from "@eduinteractive/balladui";
import { IconArrowLeft, IconEye, IconEyeOff } from "@/assets/icons/Icon";

interface SignInFormProps {
	onFormChange: (formState: AuthFormState) => void;
	onSignIn: (mail: string, password: string) => Promise<void>;
}

const SignInForm = (props: SignInFormProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	// --- State für E-Mail und Passwort
	const [mail, setMail] = useState("");
	const [password, setPassword] = useState("");

	// --- Refs für Fokushandling (optional)
	const mailRef = useRef<TextInputProps>(null);
	const passwordRef = useRef<TextInputProps>(null);

	const handleSignIn = () => {
		if (!MAIL_REGEX.test(mail)) {
			return NotificationHandler.showError("Bitte gib eine gültige E-Mail-Adresse ein.");
		}

		setIsLoading(true);
		props.onSignIn(mail, password).finally(() => setIsLoading(false));
	};

	return (
		<Fragment>
			<Flex
				direction="column"
				gap="md"
			>
				<TextInput
					size="sm"
					label="E-Mail-Adresse"
					placeholder="E-Mail-Adresse eingeben..."
					value={mail}
					onChangeText={(text) => setMail(text)}
					ref={mailRef as any}
					onSubmitEditing={() => (passwordRef.current as any)?.focus()}
					required
					style={{
						zIndex: 4,
					}}
				/>

				<TextInput
					size="sm"
					label="Passwort"
					placeholder="Passwort eingeben..."
					value={password}
					onChangeText={(text) => setPassword(text)}
					ref={passwordRef as any}
					onSubmitEditing={() => Keyboard.dismiss()}
					required
					secureTextEntry={!showPassword}
					rightSection={
						<TouchableWithoutFeedback
							onPress={() => setShowPassword(!showPassword)}
						>
                            {showPassword ? (
                                <IconEyeOff
                                    size={16}
                                />
                            ) : (
                                <IconEye
                                    size={16}
                                />
                            )}
						</TouchableWithoutFeedback>
					}
				/>
                <Flex direction="column" justify="flex-end" align="flex-end">
                    <Button
                        variant="subtle"
                        size="xs"
                        onPress={() => props.onFormChange(AuthFormState.ForgotPassword)}
                    >
                        <Text
                            c="gray.8"
                            fs={12}
                        >
                            Passwort vergessen?
                        </Text>
                    </Button>
                </Flex>
			</Flex>

			<Button
				variant="filled"
				loading={isLoading}
				loadingText="Bitte warten..."
				onPress={handleSignIn}
				radius="xs"
			>
				Anmelden
			</Button>

			<Flex
				direction="row"
				align="flex-start"
				gap="xs"
			>
				<Button
					variant="subtle"
					size="xs"
					onPress={() => props.onFormChange(AuthFormState.SignUp)}
				>
					<IconArrowLeft
						size={16}
					/>
					<Text
						c="gray.8"
						fs={12}
					>
						Noch kein Account? Jetzt registrieren!
					</Text>
				</Button>
			</Flex>
		</Fragment>
	);
};

export default SignInForm;
