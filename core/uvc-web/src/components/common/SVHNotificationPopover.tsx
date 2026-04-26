import { ActionIcon, Indicator, Paper, Popover, Text } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Notification, Tenant } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface SVHNotificationPopoverProps {
    data?: {
        notifications: (Notification & { tenantId: Tenant })[];
        unseenCount: number;
    };
    onNotificationClick: () => void;
}

const SVHNotificationPopover = (props: SVHNotificationPopoverProps) => {
    const { t } = useTranslation();

    return (
        <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
                <Indicator
                    processing={props.data?.unseenCount !== 0}
                    disabled={props.data?.unseenCount === 0}
                    size={10}
                    mt={5}
                >
                    <ActionIcon
                        c="blue"
                        variant="subtle"
                        onClick={props.onNotificationClick}
                    >
                        <IconBell />
                    </ActionIcon>
                </Indicator>
            </Popover.Target>
            <Popover.Dropdown>
                {props.data?.notifications.length === 0 && (
                    <Text size="sm">{t('COMMON.NOTIFICATIONS_EMPTY')}</Text>
                )}
                {props.data?.notifications.map((notification) => (
                    <Paper
                        key={notification._id}
                        withBorder
                        w="100%"
                        p="sm"
                        my="xs"
                    >
                        <Text size="xs" c="dimmed">
                            {notification.tenantId.title}
                        </Text>
                        <Text key={notification._id} size="sm">
                            {notification.content}
                        </Text>
                        <Text ta="right" size="xs" c="dimmed">
                            {dayjs(notification.creationDate).format(
                                'DD.MM.YYYY HH:mm'
                            )}
                        </Text>
                    </Paper>
                ))}
            </Popover.Dropdown>
        </Popover>
    );
};

export default SVHNotificationPopover;
