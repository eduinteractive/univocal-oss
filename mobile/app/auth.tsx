import ForgetPasswordForm from "@/components/features/auth/ForgetPasswordForm";
import SignInForm from "@/components/features/auth/SignInForm";
import SignUpForm from "@/components/features/auth/SignUpForm";
import { AuthFormState } from "@/constants/General";
import { useAuth } from "@/context/AuthContext";
import { applySizeProp, Card, Divider, Flex, Text } from "@eduinteractive/balladui";
import { useState } from "react";
import { Image, Keyboard, ScrollView, TouchableWithoutFeedback } from "react-native";

const Auth = () => {
	const { signIn, signInWithUniversity, signUp, forgetPassword } = useAuth();

	const [formState, setFormState] = useState<AuthFormState>(AuthFormState.SignIn);

	return (
		<TouchableWithoutFeedback
			onPress={Keyboard.dismiss}
			accessible={false}
		>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "center",
					width: "100%",
					padding: applySizeProp("md"),
					backgroundColor: "white",
				}}
			>
				<Card
					p={0}
					variant="outline"
					style={{
						overflow: "hidden",
					}}
				>
					<Flex
						p="md"
						direction="column"
						gap="xs"
						bg="blue.1"
					>
						<Image
							source={require("@/assets/images/logo.png")}
							style={{
								width: "50%",
								height: 70,
								alignSelf: "center",
							}}
							resizeMode="contain"
						/>
						<Text align="center" fs="sm">
							Deine Plattform für digitale Zusammenarbeit
						</Text>
					</Flex>
					<Divider
						color="gray.2"
						mb="md"
					/>
					<Flex
						direction="column"
						gap="md"
						p="md"
					>
						{formState === AuthFormState.SignIn && (
							<SignInForm
								onFormChange={setFormState}
								onSignIn={signIn}
								onUniversitySignIn={signInWithUniversity}
							/>
						)}
						{formState === AuthFormState.SignUp && (
							<SignUpForm
								onFormChange={setFormState}
								onSignUp={signUp}
							/>
						)}
						{formState === AuthFormState.ForgotPassword && (
							<ForgetPasswordForm
								onFormChange={setFormState}
								onForgetPassword={forgetPassword}
							/>
						)}
					</Flex>
				</Card>
			</ScrollView>
		</TouchableWithoutFeedback>
	);
};

export default Auth;
