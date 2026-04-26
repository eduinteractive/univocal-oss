import { DrawerToggleButton } from "@react-navigation/drawer";
import { TouchableOpacity, View, ScrollView, SafeAreaView } from "react-native";
import { ActionSheet, Flex, Text, Card, Box } from "@eduinteractive/balladui";
import { Fragment, useState, useEffect, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { IconArrowsLeftRight, IconLogout, IconUser, IconUsersGroup, IconChevronDown } from "@/assets/icons/Icon";
import { DrawerActions } from "@react-navigation/native";
import { TENANT_NAVIGATION_ITEMS } from "@/app/(app)/(tabs)/dashboard";

interface HeaderFeatureProps {
	title: string;
	disableNavigation?: boolean;
}

const HeaderFeature = ({ title, disableNavigation }: HeaderFeatureProps) => {
	const navigate = useNavigation();
	const { signOut } = useAuth();
	const router = useRouter();
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [actionSheetVisible, setActionSheetVisible] = useState(false);

	useFocusEffect(
		useCallback(() => {
			setDropdownVisible(false);
		}, [])
	);

	const renderNavigationItem = (item: (typeof TENANT_NAVIGATION_ITEMS)[0], index: number) => {
		return (
			<TouchableOpacity
				key={item.title}
				onPress={() => {
					router.push(item.route as any);
					setDropdownVisible(false); // Close dropdown after navigation
				}}
				style={{
					alignItems: "center",
				}}
			>
				<Card
					variant="filled"
					p="xl"
					radius={50}
					h={20}
					w={20}
					style={{
						backgroundColor: item.color,
					}}
				>
					<Flex
						direction="column"
						gap="sm"
						align="center"
						justify="center"
					>
						<item.icon
							size={22}
							color="white"
						/>
					</Flex>
				</Card>
				<Text
					fs={10}
					fw="bold"
					mt="xs"
				>
					{item.title}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={{ backgroundColor: "white", borderBottomWidth: 0.2, borderBottomColor: "#BBB" }}>
			{/* Action Sheet for user menu */}
			<ActionSheet
				visible={actionSheetVisible}
				onClose={() => setActionSheetVisible(false)}
				title="Einstellungen"
				options={[
					{
						label: "Mein Konto",
						value: "account",
						icon: <IconUser size={20} />,
					},
					{
						label: "Abmelden",
						value: "logout",
						icon: <IconLogout size={20} />,
					},
				]}
				onSelect={(option) => {
					if (option === "account") {
						router.push("/(app)/myaccount");
					} else if (option === "logout") {
						signOut();
					}
				}}
			/>

			{/* Main Header Layout */}
			<Flex
				direction="row"
				align="center"
				justify="space-between"
				px="md"
				pb={10}
				pt="xs"
			>
				{/* Left: Drawer Toggle */}
				<View style={{ marginHorizontal: 0, paddingHorizontal: -8 }}>
					<TouchableOpacity
						onPress={() => navigate.dispatch(DrawerActions.toggleDrawer())}
					>
						<IconArrowsLeftRight />
					</TouchableOpacity>
				</View>

				{/* Center: Title with Dropdown */}
				<Flex
					direction="column"
					style={{ flex: 1, alignItems: "center" }}
				>
					<TouchableOpacity
						onPress={() => {
							if (disableNavigation) {
								return;
							}
							// Add small delay to prevent rapid toggling
							setTimeout(() => {
								setDropdownVisible((prev) => !prev);
							}, 100);
						}}
						activeOpacity={0.7}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Flex
							direction="row"
							gap="sm"
							align="center"
						>
							<Text
								fs={16}
								fw="bold"
							>
								{title}
							</Text>
							{!disableNavigation && <IconChevronDown size={16} />}
						</Flex>
					</TouchableOpacity>
				</Flex>

				{/* Right: User Menu */}
				<TouchableOpacity
					onPress={() => setActionSheetVisible(true)}
					style={{ marginRight: 0 }}
				>
					<IconUser size={20} />
				</TouchableOpacity>
			</Flex>
			{dropdownVisible && !disableNavigation && (
				<Box
					pb="md"
					pt="smd"
					style={{ borderTopWidth: 0.2, borderTopColor: "#BBB" }}
				>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 10 }}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 20,
							}}
						>
							{TENANT_NAVIGATION_ITEMS.map((item, index) =>
								renderNavigationItem(item, index)
							)}
						</View>
					</ScrollView>
				</Box>
			)}
		</SafeAreaView>
	);
};

export default HeaderFeature;
