import { EDIDeleteDialog } from '@eduinteractive/mantine-common';
import { TenantInvitation } from '@eduinteractive/uvc-api';
import { useState } from 'react';
import { ActionIcon, Divider, Table, Title } from '@mantine/core';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { IconTrash } from '@tabler/icons-react';
import { getMemberRoleLabel } from '../../../../utils/Parser';
import SVHSortTable from '../../../common/SVHSortTable';
import { useTranslation } from 'react-i18next';

interface MembersInvitationsProps {
    invitations: TenantInvitation[];
    onDelete: (invitationId: string) => void;
}

const MembersInvitations = (props: MembersInvitationsProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [invitationToDelete, setInvitationToDelete] = useState<string | null>(
        null
    );

    if (checkPermission(currentTenant!, 'member:administration')) {
        return (
            <>
                <Divider my="md" />
                <Title order={6} c="dimmed" mb="xs">
                    {t('MEMBERS.INVITATIONS.TITLE')}
                </Title>
                <EDIDeleteDialog
                    title={t('MEMBERS.INVITATIONS.DELETE_TITLE')}
                    description={t('MEMBERS.INVITATIONS.DELETE_DESCRIPTION')}
                    visible={invitationToDelete !== null}
                    onClose={() => setInvitationToDelete(null)}
                    onSubmit={() => {
                        if (invitationToDelete) {
                            props.onDelete(invitationToDelete);
                        }
                        setInvitationToDelete(null);
                    }}
                    type="CONFIRM"
                />
                <SVHSortTable<TenantInvitation>
                    columns={[
                        { key: 'mail', label: t('COMMON.CONTACT.EMAIL') },
                        {
                            key: 'permissionLevel',
                            label: t('MEMBERS.TABLE.ROLE'),
                        },
                        { key: 'date', label: t('COMMON.CREATED_AT') },
                        {
                            key: 'actions',
                            label: t('MEMBERS.TABLE.ACTIONS'),
                            sortable: false,
                        },
                    ]}
                    data={props.invitations}
                    renderRow={(invitation) => (
                        <Table.Tr key={invitation._id}>
                            <Table.Td>{invitation.mail}</Table.Td>
                            <Table.Td>
                                {getMemberRoleLabel(invitation.permissionLevel)}
                            </Table.Td>
                            <Table.Td>
                                {new Date(invitation.date).toLocaleString()}
                            </Table.Td>
                            {checkPermission(
                                currentTenant!,
                                'tenant:administration'
                            ) && (
                                <Table.Td>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() =>
                                            setInvitationToDelete(
                                                invitation._id
                                            )
                                        }
                                    >
                                        <IconTrash size={24} />
                                    </ActionIcon>
                                </Table.Td>
                            )}
                        </Table.Tr>
                    )}
                />
            </>
        );
    } else {
        return null;
    }
};

export default MembersInvitations;
