import { Box, Button, Flex, Group, Text } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface TenantFunctionsProps {
    onNotification: () => void;
}

const TenantFunctions = (props: TenantFunctionsProps) => {
    const { t } = useTranslation();
    return (
        <Group align="center" gap="xl" style={{ flexWrap: 'wrap' }}>
            <Flex justify="center" w={200}>
                <Button
                    variant="default"
                    leftSection={<IconSend />}
                    size="sm"
                    style={{ width: '100%' }}
                    onClick={props.onNotification}
                >
                    {t('TENANT.NOTIFICATIONS.SEND_BUTTON')}
                </Button>
            </Flex>
            <Box style={{ flex: 1 }}>
                <Text size="sm" fw="bold">{t('TENANT.NOTIFICATIONS.SEND_TITLE')}</Text>
                <Text size="xs" c="dimmed">
                    {t('TENANT.NOTIFICATIONS.SEND_DESCRIPTION')}
                </Text>
            </Box>
        </Group>
    );
};

export default TenantFunctions;
