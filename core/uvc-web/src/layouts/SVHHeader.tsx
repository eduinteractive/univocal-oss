import {
    AppShell,
    Burger,
    Flex,
    Group,
    Text,
} from '@mantine/core';
import { useContext } from 'react';
import { SidebarContext } from './SVHAppShell';
import { useTranslation } from 'react-i18next';

const SVHHeader = () => {
    const { mobileOpened, desktopOpened, toggleDesktop, toggleMobile } =
        useContext(SidebarContext);
    const { t } = useTranslation();


    return (
        <AppShell.Header h={60}>
            <Group justify="space-between" h="100%" pr="md" pl="md">
                <Flex align="center" h="100%">
                    <Burger
                        opened={mobileOpened}
                        onClick={toggleMobile}
                        hiddenFrom="sm"
                        size="sm"
                        color="blue"
                    />
                    <Burger
                        opened={desktopOpened}
                        onClick={toggleDesktop}
                        visibleFrom="sm"
                        size="sm"
                        color="blue"
                    />
                    <Text
                        size="xl"
                        fw={900}
                        pl="md"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    >
                        {t('COMMON.APP_TITLE')}
                    </Text>
                </Flex>
            </Group>
        </AppShell.Header>
    );
};

export default SVHHeader;
