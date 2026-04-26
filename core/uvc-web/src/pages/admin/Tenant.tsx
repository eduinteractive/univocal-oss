import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Fieldset, Table, Text, Title } from '@mantine/core';
import TenantMembers from '../../components/features/admin/TenantMembers';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';
import { TenantInvitation } from '@eduinteractive/uvc-api';
import { getMemberRoleLabel } from '../../utils/Parser';

const Tenant = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const tenantQuery = useQuery({
        queryKey: ['tenant', id],
        queryFn: () => SAPI.TENANT.TENANT.getTenant({ id: id ? id : '' }),
    });

    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: SAPI.AUTH.ADMIN.getUsers,
    });

    const invitationsQuery = useQuery({
        queryKey: ['tenant-invitations', id],
        queryFn: () => SAPI.TENANT.ADMIN.getTenantInvitations({ tenantId: id! }),
        enabled: !!id,
    });

    const updateUserGroupMutation = useMutation({
        mutationFn: SAPI.AUTH.TENANT.updateUsersGroup,
        onSuccess: () => {
            tenantQuery.refetch();
            NotificationHandler.showSuccess(
                t('ADMIN_PAGES.TENANT.SUCCESS.USER_GROUP_UPDATED')
            );
        },
        onError: NotificationHandler.showError,
    });

    const addUserGroupMutation = useMutation({
        mutationFn: SAPI.AUTH.TENANT.addUsersGroup,
        onSuccess: () => {
            tenantQuery.refetch();
            NotificationHandler.showSuccess(
                t('ADMIN_PAGES.TENANT.SUCCESS.USER_ADDED')
            );
        },
        onError: NotificationHandler.showError,
    });

    const createInvitationMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.createTenantInvitation,
        onSuccess: () => {
            tenantQuery.refetch();
            invitationsQuery.refetch();
            NotificationHandler.showSuccess(
                t('ADMIN.TENANT.SUCCESS.INVITATION_CREATED')
            );
        },
        onError: NotificationHandler.showError,
    });

    const deleteUserGroupMutation = useMutation({
        mutationFn: SAPI.AUTH.TENANT.deleteUsersGroup,
        onSuccess: () => {
            tenantQuery.refetch();
            NotificationHandler.showSuccess(
                t('ADMIN_PAGES.TENANT.SUCCESS.USER_REMOVED')
            );
        },
        onError: NotificationHandler.showError,
    });

    const getStatusLabel = (status?: string) => {
        if (!status) return '-';
        switch (status) {
            case 'PENDING':
                return t('ADMIN_PAGES.TENANT.INVITATIONS_STATUS_PENDING');
            case 'ACCEPTED':
                return t('ADMIN_PAGES.TENANT.INVITATIONS_STATUS_ACCEPTED');
            case 'REJECTED':
                return t('ADMIN_PAGES.TENANT.INVITATIONS_STATUS_REJECTED');
            default:
                return status;
        }
    };

    if (tenantQuery.isLoading) return <div>Loading...</div>;

    if (tenantQuery.isError) return <div>Error</div>;

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue">
                {tenantQuery.data!.tenant.title} -{' '}
                {t('ADMIN_PAGES.TENANT.TITLE')}
            </Title>
            <TenantMembers
                allUsers={usersQuery.data || []}
                users={tenantQuery.data!.users || []}
                onAdd={(values) => {
                    if (
                        usersQuery.data?.find(
                            (user) =>
                                user.mail.toLowerCase() ===
                                values.mail.toLowerCase()
                        )
                    ) {
                        addUserGroupMutation.mutate({
                            groupId: id!,
                            body: {
                                mail: values.mail,
                                permissionLevel: values.permissionLevel,
                            },
                        });
                    } else {
                        createInvitationMutation.mutate({
                            tenantId: id!,
                            body: {
                                mail: values.mail,
                                permissionLevel: values.permissionLevel,
                            },
                        });
                    }
                }}
                onUpdate={(values) => {
                    updateUserGroupMutation.mutate({
                        groupId: id!,
                        body: {
                            userId: values.mail,
                            permissionLevel: values.permissionLevel,
                        },
                    });
                }}
                onDelete={(_id) => {
                    deleteUserGroupMutation.mutate({
                        groupId: id!,
                        userId: _id,
                    });
                }}
            />
            <Fieldset legend={t('ADMIN_PAGES.TENANT.INVITATIONS_TITLE')} mt="md" mb="md">
                <Table striped withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t('ADMIN_PAGES.TENANT.INVITATIONS_EMAIL')}</Table.Th>
                            <Table.Th>{t('ADMIN_PAGES.TENANT.INVITATIONS_DATE')}</Table.Th>
                            <Table.Th>{t('ADMIN_PAGES.TENANT.INVITATIONS_STATUS')}</Table.Th>
                            <Table.Th>{t('ADMIN_PAGES.TENANT.INVITATIONS_PERMISSION')}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {invitationsQuery.isLoading ? (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text c="dimmed" size="sm">
                                        …
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : !invitationsQuery.data?.length ? (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <Text c="dimmed" size="sm">
                                        {t('ADMIN_PAGES.TENANT.INVITATIONS_EMPTY')}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            invitationsQuery.data.map((inv: TenantInvitation) => (
                                <Table.Tr key={inv._id}>
                                    <Table.Td>{inv.mail}</Table.Td>
                                    <Table.Td>
                                        {inv.date
                                            ? new Date(inv.date).toLocaleDateString('de-DE', {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  year: 'numeric',
                                              })
                                            : '-'}
                                    </Table.Td>
                                    <Table.Td>{getStatusLabel(inv.status)}</Table.Td>
                                    <Table.Td>{getMemberRoleLabel(inv.permissionLevel)}</Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Fieldset>
        </SVHPageWrapper>
    );
};

export default Tenant;
