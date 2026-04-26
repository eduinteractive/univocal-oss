import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Contact, ContactGroup } from '@eduinteractive/uvc-api';
import SVHSortTable from '../../../../common/SVHSortTable';
import { useTenant } from '../../../../../context/TenantContext';
import { checkPermission } from '../../../../../utils/Permission';
import { useAuth } from '../../../../../context/AuthContext';
import { EDIDeleteDialog } from '@eduinteractive/mantine-common';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContactsTableProps {
    group?: ContactGroup;
    data: Contact[];
    onDelete: (userId: string) => void;
    onEdit: (data: Contact) => void;
}

const ContactsTable = (props: ContactsTableProps) => {
    const { authData } = useAuth();
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [objectToDelete, setObjectToDelete] = useState<string | null>(null);

    const columns = [
        { key: 'title', label: t('KNOWLEDGE.CONTACT.TABLE.TITLE') },
        { key: 'firstName', label: t('KNOWLEDGE.CONTACT.TABLE.FIRST_NAME') },
        { key: 'phone', label: t('COMMON.ADDRESS.PHONE') },
        { key: 'email', label: t('KNOWLEDGE.CONTACT.TABLE.EMAIL') },
        { key: 'street', label: t('COMMON.ADDRESS.ADDRESS') },
        { key: 'actions', label: t('COMMON.ACTIONS'), sortable: false },
    ];

    const renderRow = (contact: Contact) => (
        <Table.Tr key={contact._id}>
            <Table.Td>
                <Group gap="sm" align="center" wrap="nowrap">
                    <Text size="sm">{contact.title}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Group gap="sm" align="center" wrap="nowrap">
                    <Text size="sm">{contact.firstName}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{contact.phone}</Text>
            </Table.Td>
            <Table.Td>{contact.email}</Table.Td>
            <Table.Td>
                <Text size="sm">
                    {contact.street} {contact.zip} {contact.city}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap="sm" align="center">
                    {(checkPermission(currentTenant!, 'knowledge:edit') ||
                        props.group?._id === authData?._id) && (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => props.onEdit(contact)}
                        >
                            <IconEdit size={24} />
                        </ActionIcon>
                    )}
                    {(checkPermission(currentTenant!, 'knowledge:delete') ||
                        props.group?._id === authData?._id) && (
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => setObjectToDelete(contact._id)}
                        >
                            <IconTrash size={24} />
                        </ActionIcon>
                    )}
                </Group>
            </Table.Td>
        </Table.Tr>
    );

    return (
        <Table.ScrollContainer minWidth={500}>
            <EDIDeleteDialog
                title={t('COMMON.DELETE_TITLE')}
                description={t('COMMON.DELETE_DESCRIPTION')}
                visible={!!objectToDelete}
                onSubmit={() => {
                    if (objectToDelete) {
                        props.onDelete(objectToDelete);
                        setObjectToDelete(null);
                    }
                }}
                onClose={() => setObjectToDelete(null)}
                type='CONFIRM'
            />
            <SVHSortTable<Contact>
                data={props.data}
                columns={columns}
                renderRow={renderRow}
            />
        </Table.ScrollContainer>
    );
};

export default ContactsTable;
