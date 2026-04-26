import {
    Card,
    Group,
    NavLink,
    Title,
} from '@mantine/core';
import { Notification } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import TenantNotification from '../../tenant/TenantNotification';
import { useTranslation } from 'react-i18next';

interface NotificationCardProps {
    notifications: Notification[];
}

const NotificationCard = (props: NotificationCardProps) => {
    const { t } = useTranslation();

    const [currentNotifications, setCurrentNotifications] = useState<
        Notification[]
    >([]);

    useEffect(() => {
        if (props.notifications) {
            const filteredNotifications = props.notifications.slice(0, 3);
            setCurrentNotifications(filteredNotifications);
        }
    }, [props.notifications]);

    return (
        <Card withBorder shadow="sm" flex={0.6}>
            <Card.Section p="md" pt="xs">
                <Title order={6} mb="sm" c="dimmed">{t('DASHBOARD.NOTIFICATIONS_GROUP_TITLE')}</Title>
                {currentNotifications.map((notification) => (
                    <TenantNotification
                        key={notification._id}
                        notification={notification}
                    />
                ))}
                <Group justify="right" mt="md">
                    <NavLink
                        component={Link}
                        c="blue"
                        w="max-content"
                        to="/sv/notifications"
                        label={t('DASHBOARD.SHOW_MORE')}
                        rightSection={<IconChevronRight height={25} />}
                        ta="right"
                        style={{ paddingRight: 0 }}
                    />
                </Group>
            </Card.Section>
        </Card>
    );
};

export default NotificationCard;
