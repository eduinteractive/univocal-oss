import { Center, Flex, Loader, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

const SVHLoader = () => {
    const { t } = useTranslation();

    return (
        <Center h='90%' mih="50vh">
            <Flex justify="center" align="center" direction='column'>
                <Loader ta="center" />
                <Text c="dimmed" ta="center">
                    {t("COMMON.WAIT")}
                </Text>
            </Flex>
        </Center>
    );
};

export default SVHLoader;