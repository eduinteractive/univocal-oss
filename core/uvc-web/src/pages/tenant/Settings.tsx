import { useMutation, useQuery } from '@tanstack/react-query';
import { useTenant } from '../../context/TenantContext';
import TenantIntegrations from '../../components/features/tenant/TenantIntegrations';
import TenantNotificationModal from '../../components/features/tenant/TenantNotificationModal';
import { useState } from 'react';
import { SAPI, CalendarTokenStatus } from '@eduinteractive/uvc-api';
import TenantSettingsTab from '../../components/features/tenant/TenantSettingsTabs';
import TenantFunctions from '../../components/features/tenant/TenantFunctions';
import TenantMisc from '../../components/features/tenant/TenantMisc';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { currentTenant, setCurrentTenant } = useTenant();
    const { t } = useTranslation();
    const [notificationModalVisible, setNotificationModalVisible] =
        useState(false);

    const tenantQuery = useQuery({
        queryKey: ['tenant', currentTenant?._id],
        queryFn: () => SAPI.TENANT.TENANT.getTenant({ id: currentTenant?._id }),
    });

    const calendarTokenQuery = useQuery({
        queryKey: ['calendarToken', currentTenant?._id],
        queryFn: () => SAPI.CALENDAR.TENANT.getCalendarToken(currentTenant!._id),
    });

    const tenantUpdateMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.updateTenant,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT_PAGES.SETTINGS.SUCCESS.SAVED'));
            tenantQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createTenantNotificationMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.createNotification,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT_PAGES.SETTINGS.SUCCESS.NOTIFICATION_SENT'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const activateCalendarMutation = useMutation({
        mutationFn: SAPI.CALENDAR.TENANT.activateCalendar,
        onSuccess: () => {
            calendarTokenQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SETTINGS.SUCCESS.CALENDAR_ACTIVATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deactivateCalendarMutation = useMutation({
        mutationFn: SAPI.CALENDAR.TENANT.deactivateCalendar,
        onSuccess: () => {
            calendarTokenQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SETTINGS.SUCCESS.CALENDAR_DEACTIVATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    if (!tenantQuery.data) {
        return null;
    }

    return (
        <>
            <TenantNotificationModal
                visible={notificationModalVisible}
                onClose={() => setNotificationModalVisible(false)}
                onSubmit={(content) => {
                    createTenantNotificationMutation.mutate({
                        tenantId: currentTenant!._id,
                        body: { content },
                    });
                    setNotificationModalVisible(false);
                }}
            />
            <TenantSettingsTab
                integrationTab={
                    <TenantIntegrations
                        tenant={tenantQuery.data?.tenant}
                        onUpdate={({ integrations }) => {
                            tenantUpdateMutation.mutate({
                                id: currentTenant?._id,
                                body: {
                                    integrations: integrations,
                                },
                            });
                            setCurrentTenant({
                                ...currentTenant!,
                                tenant: {
                                    ...currentTenant!.tenant!,
                                    integrations: {
                                        ...currentTenant!.tenant!.integrations,
                                        ...integrations,
                                    },
                                },
                            });
                        }}
                    />
                }
                functionsTab={
                    <TenantFunctions
                        onNotification={() => setNotificationModalVisible(true)}
                    />
                }
                miscTab={
                    <TenantMisc
                        settings={{
                            calendarTokenStatus:
                                calendarTokenQuery.data?.status ===
                                CalendarTokenStatus.ACTIVE,
                        }}
                        onCalendarExport={() =>
                            calendarTokenQuery.data?.status ===
                            CalendarTokenStatus.ACTIVE
                                ? deactivateCalendarMutation.mutate(
                                      currentTenant!._id
                                  )
                                : activateCalendarMutation.mutate(
                                      currentTenant!._id
                                  )
                        }
                    />
                }
            />
        </>
    );
};

export default Settings;
