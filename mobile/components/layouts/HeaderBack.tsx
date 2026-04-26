import { IconArrowLeft, IconDotsVertical, IconEdit } from "@/assets/icons/Icon";
import { ActionSheet, applyColor, Button, Flex } from "@eduinteractive/balladui";
import { useNavigation } from "expo-router";
import { useState } from "react";


const HeaderBack = () => {
	const navigation = useNavigation();

	return (
		<Flex
			direction="row"
			gap="sm"
		>
			<Button
				variant="subtle"
				size="md"
				onPress={() => navigation.goBack()}
			>
				<IconArrowLeft
					color={applyColor("blue")}
					size={28}
				/>
			</Button>
		</Flex>
	);
};

export default HeaderBack;
