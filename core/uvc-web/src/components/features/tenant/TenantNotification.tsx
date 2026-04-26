import {
    Box,
    Button,
    Group,
    Text,
    Title,
    useMantineColorScheme,
    useMantineTheme,
} from '@mantine/core';
import { Notification } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface TenantNotificationProps {
    notification: Notification;
    admin?: boolean;
    onDelete?: (id: string) => void;
}

const TenantNotification = (props: TenantNotificationProps) => {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const colorScheme = useMantineColorScheme();

    return (
        <Box
            bg={colorScheme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.blue[0]}
            p="md"
            style={{
                borderRadius: theme.radius.sm,
            }}
            my="xs"
        >
            <Group justify="space-between">
                <Title order={6}>{props.notification.authorId}</Title>
                <Text size="xs" c="dimmed">
                    {new Date(
                        props.notification.creationDate
                    ).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </Group>
            <Text size="sm" mt="sm">
                {props.notification.content}
            </Text>
            {props.admin && (
                <Group mt="sm" justify="right">
                    <Button
                        size="xs"
                        c="red"
                        variant="light"
                        onClick={() => props.onDelete && props.onDelete(props.notification._id)}
                    >
                        {t('TENANT.NOTIFICATIONS.DELETE')}
                    </Button>
                </Group>
            )}
        </Box>
    );
};

export default TenantNotification;
