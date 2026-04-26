import { Card, Group, Tabs, Text, Title } from '@mantine/core';
import { IconBook, IconUsersGroup } from '@tabler/icons-react';
import SVHPrivacyDisclaimer from '../../../common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

interface KnowledgeTabsProps {
    wikisTab: React.ReactNode;
    contactsTab: React.ReactNode;
}

const KnowledgeTabs = (props: KnowledgeTabsProps) => {
    const { t } = useTranslation();
    return (
        <Card bg="none" radius={0}>
            <Card.Section p="md">
                <Group gap="xs">
                    <Title order={3} c="blue">
                        {t('KNOWLEDGE.TITLE')}
                    </Title>
                    <SVHPrivacyDisclaimer />
                </Group>
                <Text size="sm">
                    {t('KNOWLEDGE.DESCRIPTION')}
                </Text>
            </Card.Section>
            <Card.Section>
                <Tabs defaultValue="wikis">
                    <Tabs.List>
                        <Tabs.Tab value="wikis" leftSection={<IconBook />}>
                            {t('KNOWLEDGE.TABS.WIKIS')}
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="contacts"
                            leftSection={<IconUsersGroup />}
                        >
                            {t('KNOWLEDGE.TABS.CONTACTS')}
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="wikis" p="md">
                        {props.wikisTab}
                    </Tabs.Panel>
                    <Tabs.Panel value="contacts" p="md">
                        {props.contactsTab}
                    </Tabs.Panel>
                </Tabs>
            </Card.Section>
        </Card>
    );
};

export default KnowledgeTabs;
