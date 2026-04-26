import { Box, Flex, Image, useMantineColorScheme } from '@mantine/core';
import LOGO from '../../assets/logo.png';
import LOGO_WHITE from '../../assets/logo.png';

const SVHTitle = () => {
    const { colorScheme } = useMantineColorScheme();

    return (
        <Flex direction="column" align="center" justify="center">
            <Box h={50} mb="lg" mt="sm">
                <Image
                    src={colorScheme === "dark" ? LOGO_WHITE : LOGO}
                    alt="Univocal Logo"
                    h="100%"
                    w="auto"
                    fit="contain"
                />
            </Box>
        </Flex>
    );
};

export default SVHTitle;
