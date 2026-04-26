import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Notification,
    SAPI,
} from '@eduinteractive/uvc-api';
import { useTenant } from '../../context/TenantContext';
import { Text, Title } from '@mantine/core';
import TenantNotifications from '../../components/features/tenant/TenantNotifications';
import { useEffect, useState } from 'react';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

const Notifications = () => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const tenantQuery = useQuery({
        queryKey: ['tenant', currentTenant?.tenant?._id],
        queryFn: () => SAPI.TENANT.TENANT.getTenant({ id: currentTenant?.tenant?._id }),
    });

    const notificationQuery = useQuery({
        queryKey: ['notifications', currentTenant!.tenant!._id],
        queryFn: () => SAPI.TENANT.TENANT.getNotifications(currentTenant!.tenant!._id),
    });

    const notificationDeleteMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.deleteNotification,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT_PAGES.NOTIFICATIONS.SUCCESS.DELETED'));
            notificationQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    useEffect(() => {
        if (notificationQuery.data) {
            setNotifications(
                notificationQuery.data
                    .map((notification) => {
                        tenantQuery.data?.users.forEach((user) => {
                            if (user._id === notification.authorId) {
                                notification.authorId =
                                    user.firstName + ' ' + user.lastName;
                            }
                        });
                        return notification;
                    })
                    .sort((a, b) => {
                        return (
                            new Date(b.creationDate).getTime() -
                            new Date(a.creationDate).getTime()
                        );
                    })
            );
        }
    }, [notificationQuery.data, tenantQuery.data?.users]);

    return (
        <SVHPageWrapper p="md">
            <EDIModal
                visible={deleteId !== null}
                title={t('TENANT_PAGES.NOTIFICATIONS.DELETE_DIALOG.TITLE')}
                type="CONFIRM"
                onClose={() => setDeleteId(null)}
                onSubmit={() => {
                    notificationDeleteMutation.mutate({
                        tenantId: currentTenant!.tenant!._id,
                        notificationId: deleteId!,
                    });
                    setDeleteId(null);
                }}
            >
                <Text size="sm">
                    {t('TENANT_PAGES.NOTIFICATIONS.DELETE_DIALOG.DESCRIPTION')}
                </Text>
            </EDIModal>
            <Title order={3} c="blue" mb="sm">
                {t('TENANT_PAGES.NOTIFICATIONS.TITLE')}
            </Title>
            <TenantNotifications
                notifications={notifications}
                onDelete={setDeleteId}
            />
        </SVHPageWrapper>
    );
};

export default Notifications;
