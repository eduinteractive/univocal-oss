import { IconDotsVertical, IconEdit } from "@/assets/icons/Icon";
import { ActionSheet, applyColor, Button, Flex } from "@eduinteractive/balladui";
import { useState } from "react";

interface HeaderMenuProps {
	options: { label: string; value: string; icon?: React.ReactNode; }[];
	onSelect: (value: string) => void;
}

const HeaderMenu = (props: HeaderMenuProps) => {
	const [actionSheetVisible, setActionSheetVisible] = useState(false);

	return (
		<Flex
			direction="row"
			gap="sm"
		>
			<Button
				variant="subtle"
				size="sm"
				onPress={() => setActionSheetVisible(true)}
			>
				<IconDotsVertical
					color={applyColor("blue")}
					size={20}
				/>
			</Button>
			<ActionSheet
				visible={actionSheetVisible}
				onClose={() => setActionSheetVisible(false)}
				title="Einstellungen"
				options={props.options}
				onSelect={(option) => {
					props.onSelect(option);
					setActionSheetVisible(false);
				}}
			/>
		</Flex>
	);
};

export default HeaderMenu;
