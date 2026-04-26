import { ActionIcon, Avatar, Group, Table, Text } from '@mantine/core';
import { TenantUser } from '@eduinteractive/uvc-api';
import { IconEdit, IconMessage, IconTrash } from '@tabler/icons-react';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { checkPermission } from '../../../../utils/Permission';
import { getValidAvatarIdentifier } from '../../../../utils/BannedIdentifiers';
import SVHSortTable from '../../../common/SVHSortTable';
import { getMemberRoleLabel } from '../../../../utils/Parser';
import { useTranslation } from 'react-i18next';

interface MembersTableProps {
    users: TenantUser[];
    onChat: (userId: string) => void;
    onDelete: (userId: string) => void;
    onEdit: (userId: string) => void;
}

const MembersTable = (props: MembersTableProps) => {
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const { t } = useTranslation();

    const columns = [
        { key: 'firstName', label: t('MEMBERS.TABLE.NAME') },
        { key: 'group_permission', label: t('MEMBERS.TABLE.ROLE') },
        { key: 'actions', label: t('MEMBERS.TABLE.ACTIONS'), sortable: false },
    ];

    const renderRow = (user: TenantUser) => (
        <Table.Tr key={user._id}>
            <Table.Td>
                <Group gap="sm" align="center" wrap="nowrap">
                    <Avatar color="blue" radius="xl">
                        {getValidAvatarIdentifier(
                            user.firstName,
                            user.lastName
                        )}
                    </Avatar>
                    <Text size="sm">
                        {user.firstName} {user.lastName}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {getMemberRoleLabel(
                        user.group_permission
                    )}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap="sm" align="center">
                    {authData!._id !== user._id && (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => props.onChat(user._id)}
                        >
                            <IconMessage size={24} />
                        </ActionIcon>
                    )}
                    {checkPermission(currentTenant!, "member:administration") && (
                        <>
                            <ActionIcon
                                variant="subtle"
                                onClick={() => props.onEdit(user._id)}
                            >
                                <IconEdit size={24} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                size="compact-sm"
                                color="gray"
                                onClick={() => props.onDelete(user._id)}
                            >
                                <IconTrash size={24} />
                            </ActionIcon>
                        </>
                    )}
                </Group>
            </Table.Td>
        </Table.Tr>
    );

    return (
        <SVHSortTable<TenantUser>
            data={props.users}
            columns={columns}
            renderRow={renderRow}
        />
    );
};

export default MembersTable;
