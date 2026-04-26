import { IconExternalLink, IconLogout, IconMail, IconUsers } from "@/assets/icons/Icon";
import SVHLoader from "@/components/common/SVHLoader";
import HeaderBack from "@/components/layouts/HeaderBack";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { applyColor, Button, Divider, Flex, Text } from "@eduinteractive/balladui";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Redirect, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useRef } from "react";
import { Image, Linking, ScrollView } from "react-native";

const AppLayout = () => {
	const router = useRouter();
	const { authData, isLoading } = useAuth();
	const { currentTenant, userTenants, setCurrentTenant } = useTenant();

	const drawerRef = useRef<any>(null);

	if (isLoading) {
		return <SVHLoader />;
	}

	if (!authData) {
		return <Redirect href="/auth" />;
	}

	return (
		<Drawer
			ref={drawerRef}
			screenOptions={{
				headerLeft: () => (
					<DrawerToggleButton
						tintColor="black"
						pressColor="black"
					/>
				),
			}}
			drawerContent={() => {
				return (
					<ScrollView
						contentContainerStyle={{ flexGrow: 1 }}
						style={{ flex: 1, marginTop: 60 }}
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
						<Text
							align="center"
							fs="md"
						>
							Deine Plattform für digitale SV-Arbeit
						</Text>
						<Divider my="md" />
						<Flex
							direction="column"
							p="md"
						>
							<Text
								fs="md"
								fw="bold"
							>
								Meine Gruppen
							</Text>
							{userTenants.map((tenant) => (
								<Button
									variant="subtle"
									key={tenant._id}
									style={{
										alignContent: "flex-start",
										justifyContent: "flex-start",
										borderLeftWidth: 5,
										borderLeftColor:
											currentTenant?._id ===
											tenant._id
												? applyColor("blue.4")
												: "gray",
										paddingLeft: 10,
									}}
									my="sm"
									py="sm"
									px={0}
									onPress={() => {
										setCurrentTenant(tenant._id);
										router.navigate(
											"/(app)/(tabs)/dashboard"
										);
									}}
								>
									<Flex direction="column">
										<Text
											align="left"
											fw={
												currentTenant?._id ===
												tenant._id
													? "bold"
													: "normal"
											}
											c={
												currentTenant?._id ===
												tenant._id
													? "blue.4"
													: "gray"
											}
										>
											{tenant.title}
										</Text>
										<Text
											fs="sm"
											c={
												currentTenant?._id ===
												tenant._id
													? "blue.4"
													: "gray"
											}
										>
											{tenant.type}
										</Text>
									</Flex>
								</Button>
							))}
							<Text
								fs="md"
								fw="bold"
								mt="md"
							>
								Weiteres
							</Text>
							<Button
								variant="subtle"
								style={{
									alignContent: "flex-start",
									justifyContent: "flex-start",
								}}
								my="sm"
								mt="smd"
								py="sm"
								px={0}
								onPress={() => router.navigate("/(app)/invitations")}
							>
								<Flex
									direction="row"
									gap="sm"
									align="center"
								>
									<IconMail
										size={20}
										color="gray"
									/>
									<Text
										align="left"
										fw={"normal"}
										c={"gray"}
									>
										Einladungen
									</Text>
								</Flex>
							</Button>
							<Button
								variant="subtle"
								style={{
									alignContent: "flex-start",
									justifyContent: "flex-start",
								}}
								my="sm"
								py="sm"
								px={0}
								onPress={() => router.navigate("/(app)/opentenants")}
							>
								<Flex
									direction="row"
									gap="sm"
									align="center"
								>
									<IconUsers
										size={20}
										color="gray"
									/>
									<Text
										align="left"
										fw={"normal"}
										c={"gray"}
									>
										Offene Gruppen
									</Text>
								</Flex>
							</Button>
                            <Button
								variant="subtle"
								style={{
									alignContent: "flex-start",
									justifyContent: "flex-start",
								}}
								my="sm"
								py="sm"
								px={0}
								onPress={() => Linking.openURL("https://univocal.de/nutzungsbedingungen")}
							>
								<Flex
									direction="row"
									gap="sm"
									align="center"
								>
									<IconExternalLink
										size={20}
										color="gray"
									/>
									<Text
										align="left"
										fw={"normal"}
										c={"gray"}
									>
										Nutzungsbedingungen
									</Text>
								</Flex>
							</Button>
                            <Button
								variant="subtle"
								style={{
									alignContent: "flex-start",
									justifyContent: "flex-start",
								}}
								my="sm"
								py="sm"
								px={0}
								onPress={() => Linking.openURL("https://univocal.de/datenschutz")}
							>
								<Flex
									direction="row"
									gap="sm"
									align="center"
								>
									<IconExternalLink
										size={20}
										color="gray"
									/>
									<Text
										align="left"
										fw={"normal"}
										c={"gray"}
									>
										Datenschutzerklärung
									</Text>
								</Flex>
							</Button>
                            <Button
								variant="subtle"
								style={{
									alignContent: "flex-start",
									justifyContent: "flex-start",
								}}
								my="sm"
								py="sm"
								px={0}
								onPress={() => Linking.openURL("https://univocal.de/kontoloeschung")}
							>
								<Flex
									direction="row"
									gap="sm"
									align="center"
								>
									<IconExternalLink
										size={20}
										color="gray"
									/>
									<Text
										align="left"
										fw={"normal"}
										c={"gray"}
									>
										Konto löschen
									</Text>
								</Flex>
							</Button>
						</Flex>
					</ScrollView>
				);
			}}
		>
			<Drawer.Screen
				name="(tabs)"
				options={{ headerShown: currentTenant ? false : true, title: "Zur App" }}
			/>
			<Drawer.Screen
				name="myaccount"
				options={{ title: "Mein Konto" }}
			/>
			<Drawer.Screen
				name="invitations"
				options={{ title: "Gruppeneinladungen", headerLeft: () => <HeaderBack />}}
			/>
			<Drawer.Screen
				name="opentenants"
				options={{ title: "Offene Gruppen", headerLeft: () => <HeaderBack />}}
			/>
			<Drawer.Screen
				name="sign-out"
				options={{
					title: "Abmelden",
					drawerIcon: () => (
						<IconLogout
							color="red"
							size={19}
						/>
					),
					drawerLabelStyle: { color: "red" },
				}}
			/>
		</Drawer>
	);
};

export default AppLayout;
