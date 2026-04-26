import { ActionIcon, Button, Group, Paper, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { CalendarToken, CalendarTokenStatus } from '@eduinteractive/uvc-api';
import { useTenant } from '../../../../context/TenantContext';
import { EDIModal } from '@eduinteractive/mantine-common';
import SVHFilter, { SVHFilterObject } from '../../../common/SVHFilter';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { CALENDAR_MONTHS } from './CalendarRaster';
import { useTranslation } from 'react-i18next';

interface CalendarFilterObject extends SVHFilterObject {}

interface CalendarFilterProps {
    calenderToken?: CalendarToken;
    filter?: CalendarFilterObject;
    month: number;
    year: number;
    onAdd: () => void;
    onFilter: (filter: CalendarFilterObject) => void;
    onNextMonth: () => void;
    onPreviousMonth: () => void;
}

const CalendarFilter = (props: CalendarFilterProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <SVHFilter
            disableSort
            value={props.filter}
            onAdd={{
                func: props.onAdd,
                permission: 'calendar',
                text: '+ ' + t('CALENDAR.EVENT_NEW'),
            }}
            onFilter={props.onFilter}
            actions={
                <Group gap="sm" justify="right">
                    {props.calenderToken &&
                        props.calenderToken.status ===
                            CalendarTokenStatus.ACTIVE && (
                            <>
                                <EDIModal
                                    visible={isModalVisible}
                                    type="ALERT"
                                    onClose={() => setIsModalVisible(false)}
                                    title={t('COMMON.EXPORT')}
                                    size="lg"
                                >
                                    <Text size="xs" fw="bold">
                                        {t('CALENDAR.ICAL_TITLE')}:
                                    </Text>
                                    <Text size="xs">
                                        {t('CALENDAR.ICAL_DESCRIPTION')}
                                    </Text>
                                    <Text size="xs" mt="xs">
                                        {t('CALENDAR.ICAL_DESCRIPTION_2')}
                                    </Text>
                                    <Text size="xs" c="red" mt="xs">
                                        {t('CALENDAR.ICAL_DESCRIPTION_3')}
                                    </Text>
                                    <Paper withBorder p="sm" mt="sm" mb="sm">
                                        <Text
                                            size="xs"
                                            style={{
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {`${
                                                import.meta.env
                                                    .VITE_KUBERNETES_HOST
                                            }/api/calendar/public/tenant/${
                                                currentTenant!._id
                                            }/calendar/${
                                                props.calenderToken.token
                                            }`}
                                        </Text>
                                    </Paper>
                                </EDIModal>
                                <Button
                                    variant="filled"
                                    size="sm"
                                    onClick={() => setIsModalVisible(true)}
                                >
                                    <Text size="sm">{t('COMMON.EXPORT')}</Text>
                                </Button>
                            </>
                        )}
                </Group>
            }
        >
            <Group justify="center" align="center" h="100%" gap={0}>
                <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={props.onPreviousMonth}
                >
                    <IconArrowLeft size={24} />
                </ActionIcon>
                <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={props.onNextMonth}
                    mr="xs"
                >
                    <IconArrowRight size={24} />
                </ActionIcon>
                <Title order={5}>
                    {CALENDAR_MONTHS[props.month]} {props.year}
                </Title>
            </Group>
        </SVHFilter>
    );
};

export default CalendarFilter;
