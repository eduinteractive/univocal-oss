import { FAB, Flex, Text } from "@eduinteractive/balladui";
import { IconArrowDown } from "@/assets/icons/Icon";

interface ChatMessagesFabProps {
	count: number;
	onPress: () => void;
}

const ChatMessagesFab = ({ count, onPress }: ChatMessagesFabProps) => {
	if (count === 0) return null;

	return (
		<FAB onPress={onPress}>
			<Flex direction="column" align="center" gap="xs">
				<IconArrowDown
					size={20}
					color="white"
				/>
				<Text
					fs="sm"
					fw="bold"
					c="white"
				>
					{count}
				</Text>
			</Flex>
		</FAB>
	);
};

export default ChatMessagesFab;
