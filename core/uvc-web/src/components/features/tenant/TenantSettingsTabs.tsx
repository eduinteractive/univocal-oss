import { Card, Tabs, Text, Title } from '@mantine/core';
import { IconFunction, IconLayout2, IconMist } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface TenantSettingsTabsProps {
    integrationTab: React.ReactNode;
    functionsTab: React.ReactNode;
    miscTab: React.ReactNode;
}

const TenantSettingsTab = (props: TenantSettingsTabsProps) => {
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
                <Title order={3} c="blue">
                    {t('TENANT.SETTINGS.TITLE')}
                </Title>
                <Text size="sm">
                    {t('TENANT.SETTINGS.DESCRIPTION')}
                </Text>
            </Card.Section>
            <Card.Section>
                <Tabs defaultValue="integrations">
                    <Tabs.List>
                        <Tabs.Tab
                            value="integrations"
                            leftSection={<IconLayout2 />}
                        >
                            {t('TENANT.SETTINGS.TABS.INTEGRATIONS')}
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="functions"
                            leftSection={<IconFunction />}
                        >
                            {t('TENANT.SETTINGS.TABS.FUNCTIONS')}
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="misc"
                            leftSection={<IconMist />}
                        >
                            {t('TENANT.SETTINGS.TABS.MISC')}
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="integrations" p="md">
                        {props.integrationTab}
                    </Tabs.Panel>
                    <Tabs.Panel value="functions" p="md">
                        {props.functionsTab}
                    </Tabs.Panel>
                    <Tabs.Panel value="misc" p="md">
                        {props.miscTab}
                    </Tabs.Panel>
                </Tabs>
            </Card.Section>
        </Card>
    );
};

export default TenantSettingsTab;
