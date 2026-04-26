import { Box, Flex, Group, Switch, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface TenantMiscProps {
    settings: {
        calendarTokenStatus: boolean;
    };
    onCalendarExport: () => void;
}

const TenantMisc = (props: TenantMiscProps) => {
    const { t } = useTranslation();
    return (
        <Flex direction="column">
            <Title order={6} c="dimmed" mb="sm">
                {t('TENANT.MISC.CALENDAR_TITLE')}
            </Title>
            <Group align="center" gap="xl" style={{ flexWrap: 'wrap' }}>
                <Flex justify="center" w={100}>
                    <Switch
                        onLabel={t('TENANT.MISC.ON')}
                        offLabel={t('TENANT.MISC.OFF')}
                        size="lg"
                        checked={props.settings.calendarTokenStatus}
                        onChange={props.onCalendarExport}
                    />
                </Flex>
                <Box style={{ flex: 1 }}>
                    <Text size="sm" fw="bold">
                        {t('TENANT.MISC.CALENDAR_LABEL')}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {t('TENANT.MISC.CALENDAR_DESCRIPTION')}
                    </Text>
                </Box>
            </Group>
        </Flex>
    );
};

export default TenantMisc;
