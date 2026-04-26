import { Flex, Title } from '@mantine/core';
import { Notification } from '@eduinteractive/uvc-api';
import TenantNotification from './TenantNotification';
import { useTenant } from '../../../context/TenantContext';
import { checkPermission } from '../../../utils/Permission';
import { useTranslation } from 'react-i18next';

interface TenantNotificationsProps {
    notifications: Notification[];
    onDelete?: (id: string) => void;
}

const TenantNotifications = (props: TenantNotificationsProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();

    return (
        <Flex direction="column" gap="sm">
            {props.notifications.map((notification) => (
                <TenantNotification
                    key={notification._id}
                    notification={notification}
                    admin={checkPermission(
                        currentTenant!,
                        'notifications:delete'
                    )}
                    onDelete={props.onDelete}
                />
            ))}
            {props.notifications.length === 0 && (
                <Title order={5} ta="center" c="dimmed" fw="bold">
                    {t('TENANT.NOTIFICATIONS.EMPTY')}
                </Title>
            )}
        </Flex>
    );
};

export default TenantNotifications;
