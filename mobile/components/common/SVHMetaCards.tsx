import { FlatList, FlatListProps, Image, RefreshControl, TouchableOpacity } from "react-native";
import { BASE_URL } from "@/api/APIHandler";
import { getMemberRoles } from "@/utils/Parser";
import { useTenant } from "@/context/TenantContext";
import { useState } from "react";
import { Alert } from "react-native";
import React from "react";
import { Card, Divider, Flex, Text, ActionSheet } from "@eduinteractive/balladui";
import { IconTrash } from "@/assets/icons/Icon";
import { TenantDashboardItemType } from "@/api/Tenant";
import { TENANT_DASHBOARD_ITEM_TYPES_STRINGS } from "@/constants/Enums";

interface SVHMetaCardsProps {
	data: {
		_id?: string;
		title: string;
		description?: string;
		content?: string;
		updatedAt?: Date;
		createdAt?: Date;
		image?: string;
		viewAccess?: number;
	}[];
	deleteModal?: {
		title?: string;
		description?: string;
	};
	imageEnabled?: boolean;
	isRefreshing?: boolean;
	onRefresh?: () => void;
	prefixKey?: string;
	prefixFunc?: (val: string) => string;
	permissionPrefix: string;
	onOpen?: (metaId: string, type?: TenantDashboardItemType) => void;
	onDelete?: (metaId: string) => void;

    FlatListProps?: Partial<FlatListProps<any>>;
}

const SVHMetaCards = (props: SVHMetaCardsProps) => {
	const { currentTenant } = useTenant();
	const [selectedItem, setSelectedItem] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const handleLongPress = (itemId: string) => {
		setSelectedItem(itemId);
		setIsOpen(true);
	};

	const handleDelete = () => {
		if (selectedItem && props.onDelete) {
			Alert.alert(
				props.deleteModal?.title || "Löschen bestätigen",
				props.deleteModal?.description || "Möchtest du diesen Eintrag wirklich löschen?",
				[
					{
						text: "Abbrechen",
						style: "cancel",
					},
					{
						text: "Löschen",
						style: "destructive",
						onPress: () => {
							props.onDelete?.(selectedItem);
							setIsOpen(false);
							setSelectedItem(null);
						},
					},
				]
			);
		}
	};

	return (
		<>
			<FlatList
				{...props.FlatListProps}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 220 }}
				refreshControl={
					props.onRefresh ? (
						<RefreshControl
							refreshing={props.isRefreshing!}
							onRefresh={props.onRefresh}
						/>
					) : undefined
				}
				data={props.data}
				renderItem={({ item }) => (
					<TouchableOpacity
						onLongPress={() =>
							item._id && props.onDelete && handleLongPress(item._id)
						}
						onPress={() =>
							item._id &&
							props.onOpen &&
							props.onOpen(item._id, (item as any).type || undefined)
						}
						delayLongPress={500}
					>
						<Card
							p="md"
							variant="filled"
							m="sm"
							style={{ elevation: 2 }}
							radius="sm"
						>
							{props.imageEnabled && (
								<Image
									src={
										item.image
											? `${BASE_URL}/api/profile/image/${encodeURIComponent(
													item.image
											  )}`
											: "https://dummyimage.com/150"
									}
									alt="Project"
									className="w-full"
								/>
							)}
							{props.prefixKey && (
								<Text fs="xs">
									{props.prefixKey
										? props.prefixFunc
											? props.prefixFunc(
													(item as never)[
														props
															.prefixKey
													] as string
											  )
											: ((item as never)[
													props.prefixKey
											  ] as string)
										: ""}
								</Text>
							)}
							{(item as any).type && (
								<Text
									fs="xs"
									c="gray.4"
									pb="xs"
								>
									{
										TENANT_DASHBOARD_ITEM_TYPES_STRINGS[
											(item as any)
												.type as keyof typeof TenantDashboardItemType
										]
									}
								</Text>
							)}
							<Text
								fs="smd"
								fw="bold"
								numberOfLines={1}
							>
								{item.title}
							</Text>
							{(item.description || item.content) && (
								<Text
									fs="sm"
									numberOfLines={3}
								>
									{item.description || item.content || ""}
								</Text>
							)}
							{!Number.isNaN(item.viewAccess) && (
								<Text
									fs="xs"
									mt="sm"
									mb="md"
									c="gray.4"
								>
									Sichtbarkeit:{" "}
									{
										getMemberRoles(
											currentTenant?.type
										).find(
											(role) =>
												role.value ===
												item.viewAccess
										)?.label
									}
								</Text>
							)}
							<Divider
								my="sm"
								color="gray.3"
							/>
							<Flex
								mt="sm"
								justify="flex-end"
								align="center"
							>
								<Text
									fs="xs"
									c="gray.4"
								>
									Zuletzt aktualisiert am{" "}
									{item.updatedAt
										? new Date(
												item.updatedAt
										  ).toLocaleDateString()
										: item.createdAt
										? new Date(
												item.createdAt
										  ).toLocaleDateString()
										: ""}
								</Text>
							</Flex>
						</Card>
					</TouchableOpacity>
				)}
			/>
			<ActionSheet
				visible={isOpen}
				onClose={() => setIsOpen(false)}
				title="Aktion"
				options={[
					{
						label: "Löschen",
						value: "delete",
						icon: <IconTrash size={20} />,
					},
				]}
				onSelect={(option) => {
					if (option === "delete") {
						handleDelete();
					}
				}}
			/>
		</>
	);
};

export default SVHMetaCards;
