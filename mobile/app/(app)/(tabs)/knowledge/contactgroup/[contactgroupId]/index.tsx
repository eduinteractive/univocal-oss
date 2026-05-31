import { RelativePathString, router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Alert, TouchableOpacity } from "react-native";
import { applyColor, Box, Button, Card, FAB, Flex, Text } from "@eduinteractive/balladui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Contact, ContactGroup, deleteContactGroup, getContactGroup } from "@/api/Contact";
import { useTenant } from "@/context/TenantContext";
import UVCLoader from "@/components/common/UVCLoader";
import { IconEdit, IconPlus, IconTrash } from "@/assets/icons/Icon";
import HeaderMenu from "@/components/layouts/HeaderMenu";

export default () => {
	const { contactgroupId } = useLocalSearchParams();
	const { currentTenant } = useTenant();
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [, setContactGroup] = useState<ContactGroup | null>(null);
	const navigation = useNavigation();
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["contactGroup", currentTenant?._id, contactgroupId],
		queryFn: () =>
			getContactGroup({
				tenantId: currentTenant!._id,
				contactGroupId: contactgroupId as string,
				params: null,
			}),
	});

	const handleDelete = () => {
		Alert.alert("Löschen bestätigen", "Möchtest du diese Kontaktgruppe wirklich löschen?", [
			{
				text: "Abbrechen",
				style: "cancel",
			},
			{
				text: "Löschen",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteContactGroup({
							tenantId: currentTenant!._id,
							contactGroupId: contactgroupId as string,
						});
						queryClient.invalidateQueries({
							queryKey: ["contactGroups", currentTenant?._id, {}],
						});
					} catch (error) {
						Alert.alert(
							"Fehler",
							"Die Kontaktgruppe konnte nicht gelöscht werden."
						);
					} finally {
						router.back();
					}
				},
			},
		]);
	};

	useLayoutEffect(() => {
		if (data) {
			navigation.setOptions({
				title: data.contactGroup.title,
				headerRight: () => (
                    <HeaderMenu
                        options={[
                            { label: "Bearbeiten", value: "edit", icon: <IconEdit size={20} /> },
                            { label: "Löschen", value: "delete", icon: <IconTrash size={20} /> },
                        ]}
                        onSelect={(value) => {
                            if (value === "edit") router.push(`/knowledge/contactgroup/${contactgroupId}/edit`);
                            if (value === "delete") handleDelete();
                        }}
                    />
				)
			});
        }
	}, [data, navigation]);

	useEffect(() => {
		if (data) {
			setContactGroup(data.contactGroup);
			setContacts(data.contacts);
		}
	}, [data]);

	const renderContact = ({ item }: { item: Contact }) => {
		return (
			<TouchableOpacity
				onLongPress={() => {}}
				onPress={() => {
					router.navigate(
						`/knowledge/contactgroup/${contactgroupId}/contact/${item._id}/edit` as RelativePathString
					);
				}}
				style={{ backgroundColor: "white" }}
			>
				<Card
					variant="outline"
					bg="white"
					radius={0}
					style={{
						borderTopWidth: 0.25,
						borderBottomWidth: 0.25,
					}}
					p="md"
				>
					{(item.firstName || item.lastName) && (
						<Text fs="smd">
							{item.firstName} {item.lastName}
						</Text>
					)}
					{item.email && (
						<Text
							fs="sm"
							c="gray.5"
						>
							{item.email}
						</Text>
					)}
					{item.phone && (
						<Text
							fs="xs"
							c="gray.5"
						>
							{item.phone}
						</Text>
					)}
					{item.description && (
						<Text
							fs="sm"
							mt="sm"
							c="gray.5"
						>
							{item.description}
						</Text>
					)}
				</Card>
			</TouchableOpacity>
		);
	};

	if (isLoading) {
		return <UVCLoader />;
	}

	return (
		<Box flex={1}>
			<FlatList
				data={contacts}
				renderItem={renderContact}
				keyExtractor={(item: Contact) => item._id}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() =>
					router.navigate(
						`/knowledge/contactgroup/${contactgroupId}/contact/new` as RelativePathString
					)
				}
			>
				<Flex
					direction="row"
					align="center"
					gap="sm"
				>
					<IconPlus
						size={18}
						color="white"
					/>
					<Text
						fs="sm"
						fw="bold"
						c="white"
					>
						Neuer Kontakt
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
