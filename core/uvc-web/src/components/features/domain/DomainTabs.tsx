import {
    Card,
    Flex,
    Group,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import {
    IconNetwork,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DomainTabsProps {
    networksTab: React.ReactNode;
}

const DomainTabs = (props: DomainTabsProps) => {
    const { t } = useTranslation();

    return (
        <Card
            bg="none"
            radius={0}
            style={{
                overflow: 'visible',
            }}
        >
            <Card.Section p="md">
                <Group justify="space-between">
                    <Flex direction="column" flex={0.4}>
                        <Title order={3} c="blue">
                            {t("ADMIN.DOMAIN_ADMINISTRATION")}
                        </Title>
                        <Text size="sm">
                            {t("ADMIN.DOMAIN_ADMINISTRATION_DESCRIPTION")}
                        </Text>
                    </Flex>
                </Group>
            </Card.Section>
            <Card.Section>
                <Tabs defaultValue="networks">
                    <Tabs.List>
                        <Tabs.Tab
                            value="networks"
                            leftSection={<IconNetwork />}
                        >
                            {t("ADMIN.DOMAIN_TAB_NETWORKS")}
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="networks" p="md">
                        {props.networksTab}
                    </Tabs.Panel>
                </Tabs>
            </Card.Section>
        </Card>
    );
};

export default DomainTabs;
