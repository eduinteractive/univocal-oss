import { useMutation, useQuery } from '@tanstack/react-query';
import { useTenant } from '../../context/TenantContext';
import {
    TenantUser,
    SAPI,
} from '@eduinteractive/uvc-api';
import { Text, Title } from '@mantine/core';
import { useState } from 'react';
import MembersTable from '../../components/features/tenant/members/MembersTable';
import MemberModal from '../../components/features/tenant/members/MemberModal';
import { useNavigate } from 'react-router-dom';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import {
    EDIDeleteDialog,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import MembersInvitations from '../../components/features/tenant/members/MembersInvitations';
import MembersJoinRequests from '../../components/features/tenant/members/MembersJoinRequests';
import SVHFilter, { SVHFilterObject } from '../../components/common/SVHFilter';
import { useTranslation } from 'react-i18next';

const Members = () => {
    const navigate = useNavigate();
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);

    const tenantMemberQuery = useQuery({
        queryKey: ['tenant', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.TENANT.TENANT.getTenant({ id: currentTenant?._id, params: metadataFilter }),
    });

    const tenantInvitationsQuery = useQuery({
        queryKey: ['tenantInvitationByTenant', currentTenant?._id],
        queryFn: () => SAPI.TENANT.TENANT.getInvitationsByTenant({ tenantId: currentTenant!._id }),
    });

    const tenantJoinRequestsQuery = useQuery({
        queryKey: ['tenantJoinRequests', currentTenant?._id],
        queryFn: () =>
            SAPI.TENANT.TENANT.getTenantJoinRequests({ tenantId: currentTenant!._id }),
    });

    const tenantMemberUpdateGroup = useMutation({
        mutationFn: SAPI.AUTH.TENANT.updateUsersGroup,
        onSuccess: () => {
            NotificationHandler.showSuccess('Mitglied erfolgreich bearbeitet!');
            tenantMemberQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const tenantMemberDeleteGroup = useMutation({
        mutationFn: SAPI.AUTH.TENANT.deleteUsersGroup,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT_PAGES.MEMBERS.SUCCESS.DELETED'));
            tenantMemberQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const tenantMemberInviteMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.createInvitation,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT_PAGES.MEMBERS.SUCCESS.INVITED'));
            tenantInvitationsQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const tenantMemberDeleteInviteMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.deleteTenantInvitation,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT_PAGES.MEMBERS.SUCCESS.INVITATION_DELETED'));
            tenantInvitationsQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const acceptJoinRequestMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.acceptTenantJoinRequest,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('MEMBERS.REQUESTS.SUCCESS_ACCEPT'));
            tenantJoinRequestsQuery.refetch();
            tenantMemberQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const rejectJoinRequestMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.rejectTenantJoinRequest,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('MEMBERS.REQUESTS.SUCCESS_REJECT'));
            tenantJoinRequestsQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    if (!tenantMemberQuery.data) {
        return null;
    }

    return (
        <SVHPageWrapper p="md">
            <EDIDeleteDialog
                visible={deleteUserId !== null}
                title={t('TENANT_PAGES.MEMBERS.DELETE_DIALOG.TITLE')}
                description={t('TENANT_PAGES.MEMBERS.DELETE_DIALOG.DESCRIPTION')}
                type="CONFIRM"
                onClose={() => setDeleteUserId(null)}
                onSubmit={() => {
                    tenantMemberDeleteGroup.mutate({
                        groupId: currentTenant!._id,
                        userId: deleteUserId!,
                    });
                    setDeleteUserId(null);
                }}
            />
            <Title order={3} c="blue">
                {t('TENANT_PAGES.MEMBERS.TITLE')}
            </Title>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.MEMBERS.DESCRIPTION')}
            </Text>
            <SVHFilter
                disableSort
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () =>
                        setCurrentUser({
                            _id: '',
                            firstName: '',
                            lastName: '',
                            mail: '',
                            group_permission: 0,
                            group_id: currentTenant!._id,
                        }),
                    text: t('TENANT_PAGES.MEMBERS.ADD_MEMBER'),
                    permission: 'member:administration',
                }}
            />
            <MembersTable
                users={tenantMemberQuery.data.users || []}
                onChat={(userId) => {
                    navigate(`/user/chat/${userId}`);
                }}
                onDelete={(userId) => {
                    setCurrentUser(null);
                    setDeleteUserId(userId);
                }}
                onEdit={(userId) =>
                    setCurrentUser(
                        tenantMemberQuery.data.users.find(
                            (user) => user._id === userId
                        ) || null
                    )
                }
            />
            <MembersInvitations
                invitations={tenantInvitationsQuery.data || []}
                onDelete={(invitationId) => {
                    tenantMemberDeleteInviteMutation.mutate({
                        tenantId: currentTenant!._id,
                        invitationId: invitationId,
                    });
                }}
            />
            <MembersJoinRequests
                requests={tenantJoinRequestsQuery.data || []}
                onAccept={(requestId) =>
                    acceptJoinRequestMutation.mutate({
                        tenantId: currentTenant!._id,
                        requestId,
                    })
                }
                onReject={(requestId) =>
                    rejectJoinRequestMutation.mutate({
                        tenantId: currentTenant!._id,
                        requestId,
                    })
                }
            />
            <MemberModal
                user={currentUser}
                onSave={(permission, mail) => {
                    if (currentUser?._id === '') {
                        tenantMemberInviteMutation.mutate({
                            body: {
                                tenantId: currentTenant!._id,
                                mail: mail,
                                permissionLevel: permission,
                            },
                        });
                    } else {
                        tenantMemberUpdateGroup.mutate({
                            groupId: currentTenant!._id,
                            body: {
                                userId: currentUser?._id || '',
                                permissionLevel: permission,
                            },
                        });
                    }
                    setCurrentUser(null);
                }}
                onClose={() => setCurrentUser(null)}
            />
        </SVHPageWrapper>
    );
};

export default Members;
