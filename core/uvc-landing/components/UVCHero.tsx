import { Box, Button, Flex, Text, ThemeIcon, Title } from "@mantine/core";
import { COLORS } from "../constants/Colors";

interface UVCHeroProps {
	title: string;
	subtitle?: string;
	justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
	content: string | React.ReactNode;
}

const UVCHero = (props: UVCHeroProps) => {
	return (
		<Box
			bg={COLORS.SECONDARY}
			py={100}
			px="xl"
		>
			<Flex
				direction="row"
				gap="xl"
				justify={props.justify ? props.justify : "space-around"}
				align="center"
			>
				<Flex
					direction="column"
					flex={1}
					justify={"flex-start"}
				>
					<Title
						order={2}
						mb={5}
						ta={"start"}
						c={COLORS.PRIMARY}
					>
						{props.title}
					</Title>
					{props.subtitle && (
						<Title
							order={4}
                            fw="normal"
							ta={"start"}
							c={COLORS.PRIMARY}
						>
							{props.subtitle}
						</Title>
					)}
					<Text
						size="md"
						ta="justify"
						c={COLORS.PRIMARY}
					>
						{props.content}
					</Text>
				</Flex>
			</Flex>
		</Box>
	);
};

export default UVCHero;
