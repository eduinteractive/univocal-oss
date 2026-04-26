import { Flex, Text, Title } from '@mantine/core';
import { useTenant } from '../../context/TenantContext';
import MemberCard from '../../components/features/tenant/dashboard/MemberCard';
import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import NotificationCard from '../../components/features/tenant/dashboard/NotificationCard';
import { Notification } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import CalendarCard from '../../components/features/tenant/dashboard/CalendarCard';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const calendarEventsQuery = useQuery({
        queryKey: ['calendarEvents', currentTenant?._id],
        queryFn: () => SAPI.CALENDAR.TENANT.getCalendarEvents({
            tenantId: currentTenant!._id,
            params: null
        }),
    });

    const tenantQuery = useQuery({
        queryKey: ['tenant', currentTenant?.tenant?._id],
        queryFn: () => SAPI.TENANT.TENANT.getTenant({ id: currentTenant?.tenant?._id }),
    });

    const notificationQuery = useQuery({
        queryKey: ['notifications', currentTenant!.tenant!._id],
        queryFn: () => SAPI.TENANT.TENANT.getNotifications(currentTenant!.tenant!._id),
    });

    useEffect(() => {
        if (notificationQuery.data) {
            setNotifications(
                notificationQuery.data.map((notification) => {
                    tenantQuery.data?.users.forEach((user) => {
                        if (user._id === notification.authorId) {
                            notification.authorId =
                                user.firstName + ' ' + user.lastName;
                        }
                    });
                    return notification;
                })
            );
        }
    }, [notificationQuery.data, tenantQuery.data?.users]);

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue">
                {t('TENANT_PAGES.DASHBOARD.TITLE')}
            </Title>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.DASHBOARD.DESCRIPTION')}
            </Text>
            <Flex
                direction={{
                    base: 'column',
                    md: 'row',
                    xs: 'column',
                    sm: 'column',
                }}
                gap="md"
            >
                <MemberCard users={tenantQuery.data?.users || []} />
                <NotificationCard notifications={notifications} />
            </Flex>
            <CalendarCard events={calendarEventsQuery.data || []} />
        </SVHPageWrapper>
    );
};

export default Dashboard;
