import { Profile } from "@/api/Profile";
import { applyColor, Box, Button, Flex, Text } from "@eduinteractive/balladui";
import { BASE_URL } from "@/api/APIHandler";
import { useTenant } from "@/context/TenantContext";
import type { TenantVisibility } from "@/api/Tenant";
import { Image } from "react-native";
import { IconEdit } from "@/assets/icons/Icon";
import { router } from "expo-router";

interface ProfileGeneralProps {
	data?: {
		profile: Profile;
	};
}

const TENANT_VISIBILITY_LABEL: Record<TenantVisibility, string> = {
	PUBLIC: "Öffentlich",
	HIDDEN: "Nicht öffentlich",
	ON_REQUEST: "Auf Anfrage",
};

export default (props: ProfileGeneralProps) => {
	const { currentTenant } = useTenant();
	const profile = props.data?.profile;

	return (
		<Flex
			direction="column"
			gap="md"
			p="md"
			bg="white"
			flex={1}
		>
			<Flex
				direction="row"
				gap="md"
				align="center"
			>
				{profile?.avatarImage && (
					<Image
						source={{
							uri: `${BASE_URL}/api/profile/image/${encodeURIComponent(
								profile.avatarImage
							)}`,
						}}
						style={{
							width: 80,
							height: 80,
							borderRadius: 10,
						}}
					/>
				)}
				<Flex
					direction="column"
					gap="sm"
					flex={1}
				>
					<Flex
						direction="row"
						gap="xs"
						align="center"
					>
						<Text
							fs="xl"
							fw="bold"
						>
							{currentTenant?.tenant?.title || "Unbekannte Gruppe"}
						</Text>
						<Button
							variant="subtle"
							size="sm"
							onPress={() => {
								router.push("/profile/edit");
							}}
						>
							<IconEdit
								size={20}
								color={applyColor("blue")}
							/>
						</Button>
					</Flex>
					{currentTenant?.tenant?.visibility != null && (
						<Text
							fs="sm"
							c="gray.4"
						>
							{TENANT_VISIBILITY_LABEL[currentTenant.tenant.visibility]}
						</Text>
					)}
				</Flex>
			</Flex>

			{/* Description */}
			{profile?.description && (
				<Box>
					<Text
						fs="md"
						fw="bold"
					>
						Beschreibung
					</Text>
					<Text fs="sm">{profile.description}</Text>
				</Box>
			)}

			{/* Contact Information */}
			<Box>
				<Text
					fs="md"
					fw="bold"
					mb="sm"
				>
					Kontaktinformationen
				</Text>
				<Flex
					direction="column"
					gap="sm"
				>
					{profile?.contactPerson && (
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text
								fs="sm"
								c="gray.4"
							>
								Ansprechperson:
							</Text>
							<Text fs="sm">{profile.contactPerson}</Text>
						</Flex>
					)}
					{profile?.contactEmail && (
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text
								fs="sm"
								c="gray.4"
							>
								E-Mail:
							</Text>
							<Text fs="sm">{profile.contactEmail}</Text>
						</Flex>
					)}
					{profile?.contactPhone && (
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text
								fs="sm"
								c="gray.4"
							>
								Telefon:
							</Text>
							<Text fs="sm">{profile.contactPhone}</Text>
						</Flex>
					)}
					{profile?.contactWebsite && (
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text
								fs="sm"
								c="gray.4"
							>
								Website:
							</Text>
							<Text fs="sm">{profile.contactWebsite}</Text>
						</Flex>
					)}
					{profile?.publicPerson && (
						<Flex
							direction="row"
							justify="space-between"
						>
							<Text
								fs="sm"
								c="gray.4"
							>
								Öffentliche Person:
							</Text>
							<Text fs="sm">{profile.publicPerson}</Text>
						</Flex>
					)}
				</Flex>
			</Box>
		</Flex>
	);
};
