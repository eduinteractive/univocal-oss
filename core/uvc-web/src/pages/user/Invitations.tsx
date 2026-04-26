import { Button, Group, Table, Title } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { eventEmitter } from '../../context/AuthContext';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';
import { getMemberRoleLabel } from '../../utils/Parser';

const Invitations = () => {
    const { t } = useTranslation();
    const tenantInvitationsQuery = useQuery({
        queryKey: ['tenantInvitations'],
        queryFn: () => SAPI.TENANT.PRIVATE.getUserTenantInvitations(),
    });

    const acceptInvitationMutation = useMutation({
        mutationFn: SAPI.TENANT.PRIVATE.acceptInvitation,
        onSuccess: () => {
            eventEmitter.emit('refreshAuth');
            tenantInvitationsQuery.refetch();
            NotificationHandler.showSuccess(
                t('PAGES.USER.INVITATIONS.SUCCESS_ACCEPT')
            );
            setTimeout(() => {
                window.location.reload();
            }, 2000)
        },
        onError: NotificationHandler.showAxiosError,
    });

    const declineInvitationMutation = useMutation({
        mutationFn: SAPI.TENANT.PRIVATE.declineInvitation,
        onSuccess: () => {
            tenantInvitationsQuery.refetch();
            NotificationHandler.showSuccess(t('PAGES.USER.INVITATIONS.SUCCESS_DECLINE'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="sm">
                {t('PAGES.USER.INVITATIONS.TITLE')}
            </Title>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('PAGES.USER.INVITATIONS.TABLE_HEADERS.GROUP')}</Table.Th>
                        <Table.Th>{t('PAGES.USER.INVITATIONS.TABLE_HEADERS.INVITED_AT')}</Table.Th>
                        <Table.Th>{t('PAGES.USER.INVITATIONS.TABLE_HEADERS.INVITED_AS')}</Table.Th>
                        <Table.Th>{t('PAGES.USER.INVITATIONS.TABLE_HEADERS.ACTIONS')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {tenantInvitationsQuery.data?.map((invitation) => (
                        <Table.Tr key={invitation._id}>
                            <Table.Td>{invitation.tenant.title}</Table.Td>
                            <Table.Td>
                                {new Date(invitation.date).toLocaleDateString()}
                            </Table.Td>
                            <Table.Td>{getMemberRoleLabel(invitation.permissionLevel)}</Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <Button
                                        variant="light"
                                        onClick={() =>
                                            acceptInvitationMutation.mutate({
                                                invitationId: invitation._id,
                                            })
                                        }
                                    >
                                        {t('PAGES.USER.INVITATIONS.BUTTONS.ACCEPT')}
                                    </Button>
                                    <Button
                                        variant="light"
                                        onClick={() =>
                                            declineInvitationMutation.mutate({
                                                invitationId: invitation._id,
                                            })
                                        }
                                    >
                                        {t('PAGES.USER.INVITATIONS.BUTTONS.DECLINE')}
                                    </Button>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {tenantInvitationsQuery.data?.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={4}>
                                {t('PAGES.USER.INVITATIONS.NO_INVITATIONS')}
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </SVHPageWrapper>
    );
};

export default Invitations;
