import {
    Tabs,
    Flex,
    Text,
    Title,
    Button,
    Group,
    Box,
    ActionIcon,
} from '@mantine/core';
import dayjs from 'dayjs';
import { IconDownload, IconEdit, IconFileDescription, IconMail, IconSettings, IconUsers } from '@tabler/icons-react';
import { Contact, ContactGroup } from '@eduinteractive/uvc-api';
import { useEffect, useMemo, useState } from 'react';
import { EDIModal, EDITextarea } from '@eduinteractive/mantine-common';
import { CSVLink } from 'react-csv';
import { useTenant } from '../../../../../context/TenantContext';
import { checkPermission } from '../../../../../utils/Permission';
import { useAuth } from '../../../../../context/AuthContext';
import SVHTabs from '../../../../common/SVHTabs';
import { useTranslation } from 'react-i18next';

interface ContactGroupTabsProps {
    contacts?: Contact[];
    contactsTab: React.ReactNode;
    data?: ContactGroup;
    onEdit: () => void;
}

const ContactGroupTabs = (props: ContactGroupTabsProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();
    const [contactsExportModalVisible, setContactsExportModalVisible] =
        useState(false);
    const [csvData, setCsvData] = useState<
        {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            description: string;
        }[]
    >([]);

    const hasPermission = useMemo(() => {
        return (
            checkPermission(currentTenant!, 'budget:edit') ||
            props.data?.authorId === authData?._id
        );
    }, [currentTenant, authData, props.data]);

    const headers = useMemo(
        () => [
            { label: 'Bezeichnung', key: 'title' },
            { label: 'Vorname', key: 'firstName' },
            { label: 'Nachname', key: 'lastName' },
            { label: 'E-Mail', key: 'email' },
            { label: 'Telefon', key: 'phone' },
            { label: 'Beschreibung', key: 'description' },
            { label: 'Straße', key: 'street' },
            { label: 'PLZ', key: 'zip' },
            { label: 'Ort', key: 'city' },
        ],
        []
    );

    useEffect(() => {
        setCsvData(
            props.contacts?.map((contact) => ({
                title: contact.title || '',
                firstName: contact.firstName || '',
                lastName: contact.lastName || '',
                email: contact.email || '',
                street: contact.street || '',
                zip: contact.zip || '',
                city: contact.city || '',
                phone: contact.phone || '',
                description: contact.description || '',
            })) || []
        );
    }, [props.contacts]);
    return (
        <SVHTabs defaultValue="contacts" title={props.data?.title}>
            <EDIModal
                title={t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.EXPORT_MODAL_TITLE')}
                type="ALERT"
                visible={contactsExportModalVisible}
                onClose={() => setContactsExportModalVisible(false)}
            >
                <EDITextarea
                    label={t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.EXPORT_MODAL_LABEL')}
                    placeholder={t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.EXPORT_MODAL_PLACEHOLDER')}
                    value={props.contacts
                        ?.map((contact) => contact.email)
                        .join(';\n')}
                    autosize
                    readOnly
                    maxRows={20}
                />
            </EDIModal>
            <Tabs.List>
                <Tabs.Tab value="contacts" leftSection={<IconUsers />}>{t('KNOWLEDGE.CONTACT_GROUP.TABS.CONTACTS')}</Tabs.Tab>
                <Tabs.Tab value="general" leftSection={<IconFileDescription />}>{t('KNOWLEDGE.CONTACT_GROUP.TABS.GENERAL')}</Tabs.Tab>
                <Tabs.Tab value="functions" leftSection={<IconSettings />}>{t('KNOWLEDGE.CONTACT_GROUP.TABS.FUNCTIONS')}</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="contacts" p="md">
                {props.contactsTab}
            </Tabs.Panel>
            <Tabs.Panel value="general" p="md">
                <Flex justify="space-between">
                    <Flex direction="column" gap={0}>
                        <Title order={3}>{props.data?.title}</Title>
                        <Text size="sm">{props.data?.description}</Text>
                    </Flex>
                    {hasPermission && (
                        <ActionIcon variant="subtle">
                            <IconEdit size={24} onClick={props.onEdit} />
                        </ActionIcon>
                    )}
                </Flex>
                <Flex align="end" justify="end" direction="column" mt="sm">
                    <Text size="sm" c="dimmed">
                        {t('KNOWLEDGE.CONTACT_GROUP.META.CREATED_AT')}: 
                        {dayjs(props.data?.createdAt).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {t('KNOWLEDGE.CONTACT_GROUP.META.UPDATED_AT')}: 
                        {dayjs(props.data?.updatedAt).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                    </Text>
                </Flex>
            </Tabs.Panel>

            <Tabs.Panel value="functions" p="md">
                <Title order={6} c="dimmed" mb="xs">
                    {t('KNOWLEDGE.CONTACT_GROUP.TABS.FUNCTIONS')}
                </Title>
                <Group align="center" gap="xl" style={{ flexWrap: 'wrap' }}>
                    <Flex justify="center" w={150}>
                        <Button
                            variant="default"
                            leftSection={<IconMail />}
                            size="sm"
                            style={{ width: '100%' }}
                            onClick={() => setContactsExportModalVisible(true)}
                        >
                            {t('COMMON.EXPORT')}
                        </Button>
                    </Flex>
                    <Box style={{ flex: 1 }}>
                        <Text>{t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.EMAIL_EXPORT_TITLE')}</Text>
                        <Text size="xs" c="dimmed">
                            {t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.EMAIL_EXPORT_DESCRIPTION')}
                        </Text>
                    </Box>
                </Group>
                <Group
                    align="center"
                    gap="xl"
                    style={{ flexWrap: 'wrap' }}
                    mt="md"
                >
                    <Flex justify="center" w={150}>
                        <CSVLink
                            data={csvData}
                            headers={headers}
                            filename={'contacts.csv'}
                            target="_blank"
                            style={{ width: 150 }}
                            separator=";"
                        >
                            <Button
                                variant="default"
                                leftSection={<IconDownload />}
                                size="sm"
                                style={{ width: '100%' }}
                            >
                                {t('COMMON.EXPORT')}
                            </Button>
                        </CSVLink>
                    </Flex>
                    <Box style={{ flex: 1 }}>
                        <Text>{t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.CSV_EXPORT_TITLE')}</Text>
                        <Text size="xs" c="dimmed">
                            {t('KNOWLEDGE.CONTACT_GROUP.FUNCTIONS.CSV_EXPORT_DESCRIPTION')}
                        </Text>
                    </Box>
                </Group>
            </Tabs.Panel>
        </SVHTabs>
    );
};

export default ContactGroupTabs;
