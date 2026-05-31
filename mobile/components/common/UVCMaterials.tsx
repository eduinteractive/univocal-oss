import React from "react";
import { TouchableOpacity } from "react-native";
import { Card, Text, Flex, Box, applyColor } from "@eduinteractive/balladui";
import { IconExternalLink, IconFile, IconTrash } from "@/assets/icons/Icon";

export interface Material {
	title: string;
	link: string;
	mimetype?: string;
}

interface UVCMaterialsProps {
	isForm?: boolean;
	materials: Material[];
	title?: string;
	onPress?: (material: Material, index: number) => void;
}

const UVCMaterials: React.FC<UVCMaterialsProps> = ({ isForm, materials, onPress, title = "Materialien" }) => {
	if (!materials || materials.length === 0) return null;

	return (
		<Flex direction="column" gap="sm">
			{materials.map((material, index) => (
				<TouchableOpacity
					key={index}
					onPress={() => (onPress ? onPress(material, index) : null)}
				>
					<Card
						variant="outline"
						p="md"
						style={{ borderColor: "#e0e0e0" }}
					>
						<Flex
							direction="row"
							align="center"
							gap="sm"
						>
							<IconFile
								size={20}
								color={applyColor("blue")}
							/>
							<Box flex={1}>
								<Text
									fs="sm"
									c="blue"
								>
									{material.title}
								</Text>
								{material.mimetype && (
									<Text
										fs="xs"
										c="gray.6"
									>
										{material.mimetype}
									</Text>
								)}
							</Box>
							{!isForm && (
								<IconExternalLink
									size={16}
									color={applyColor("gray.5")}
								/>
							)}
							{isForm && (
								<IconTrash
									size={16}
									color={applyColor("gray.5")}
								/>
							)}
						</Flex>
					</Card>
				</TouchableOpacity>
			))}
		</Flex>
	);
};

export default UVCMaterials;
