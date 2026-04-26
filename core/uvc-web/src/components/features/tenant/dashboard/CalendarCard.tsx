import { useState } from 'react';
import { CalendarEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import {
    ActionIcon,
    Card,
    Flex,
    Group,
    Indicator,
    Paper,
    SimpleGrid,
    Text,
    Title,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import CalendarViewModal from '../../tenant/calendar/CalendarViewModal';

interface CalendarCardProps {
    events: CalendarEvent[];
    onDelete?: (eventId: string) => void;
    onEdit?: (event: CalendarEvent) => void;
}

const CalendarCard = (props: CalendarCardProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const [selected, setSelected] = useState<Date | null>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );

    const handleSelect = (date: Date) => {
        if (dayjs(date).isSame(selected, 'date')) {
            setSelected(null);
            return;
        }
        setSelected(date);
    };

    return (
        <Card withBorder shadow="sm" flex={0.6} mt="sm">
            <Card.Section p="md" pt="xs">
                <Title order={6} mb="sm" c="dimmed">
                    {t('DASHBOARD.CALENDAR_TITLE')}
                </Title>
                <SimpleGrid cols={{ xs: 1, md: 1, lg: 2 }}>
                    <Calendar
                        getDayProps={(date) => ({
                            selected: dayjs(date).isSame(selected, 'date'),
                            onClick: () => handleSelect(date),
                        })}
                        styles={{
                            levelsGroup: {
                                width: '100%',
                                maxWidth: 'unset',
                            },
                            calendarHeader: {
                                width: '100%',
                                maxWidth: 'unset',
                            },
                            monthCell: {
                                padding: 10,
                            },
                        }}
                        renderDay={(date) => {
                            const event = props.events.find((event) =>
                                dayjs(event.startDate).isSame(date, 'day')
                            );
                            if (event) {
                                return (
                                    <Indicator size={6} offset={-2}>
                                        <div>{date.getDate()}</div>
                                    </Indicator>
                                );
                            }
                        }}
                    />
                    <Flex direction="column" miw="50%">
                        <Title
                            order={5}
                            c="blue"
                            fw={600}
                            style={{
                                borderBottom: '1px solid #e1e1e1',
                            }}
                        >
                            {selected &&
                                t('CALENDAR.EVENTS_ON_DATE', {
                                    date: dayjs(selected)
                                        .locale('de')
                                        .format('DD. MMMM YYYY'),
                                })}
                            {!selected && t('CALENDAR.FUTURE_EVENTS')}
                        </Title>
                        <CalendarViewModal
                            event={selectedEvent}
                            onClose={() => setSelectedEvent(null)}
                        />
                        {props.events
                            .filter((event) =>
                                selected
                                    ? dayjs(event.startDate).isSame(
                                          selected,
                                          'day'
                                      )
                                    : dayjs(event.startDate).isAfter(new Date())
                            )
                            .map((event, index) => {
                                if (!selected && index > 2) {
                                    return null;
                                } else {
                                    return (
                                        <Flex
                                            key={event._id}
                                            dir="column"
                                            gap="xs"
                                            mt="sm"
                                        >
                                            <Paper
                                                p="sm"
                                                radius="sm"
                                                withBorder
                                                w="100%"
                                            >
                                                <Group
                                                    gap="sm"
                                                    align="center"
                                                    justify="space-between"
                                                    w="100%"
                                                >
                                                    <div>
                                                        {!selected && (
                                                            <Text
                                                                size="xs"
                                                                c="dimmed"
                                                            >
                                                                {dayjs(
                                                                    event.startDate
                                                                ).format(
                                                                    'DD.MM.YYYY HH:mm'
                                                                )}{' '}
                                                                {event.endDate &&
                                                                    ' - ' +
                                                                        dayjs(
                                                                            event.endDate
                                                                        ).format(
                                                                            'DD.MM.YYYY HH:mm'
                                                                        )}
                                                            </Text>
                                                        )}
                                                        {selected && (
                                                            <Text
                                                                size="xs"
                                                                c="dimmed"
                                                            >
                                                                {dayjs(
                                                                    event.startDate
                                                                ).format(
                                                                    'HH:mm'
                                                                )}
                                                                {event.endDate &&
                                                                    ' - ' +
                                                                        dayjs(
                                                                            event.endDate
                                                                        ).format(
                                                                            'HH:mm'
                                                                        )}
                                                            </Text>
                                                        )}
                                                        <Text
                                                            size="sm"
                                                            fw="bold"
                                                        >
                                                            {event.title}
                                                        </Text>
                                                        <Text
                                                            size="xs"
                                                            c="dimmed"
                                                        >
                                                            {event.description}
                                                        </Text>
                                                    </div>
                                                    <Group gap="xs">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            onClick={() =>
                                                                setSelectedEvent(
                                                                    event
                                                                )
                                                            }
                                                        >
                                                            <IconEye />
                                                        </ActionIcon>
                                                        {(checkPermission(
                                                            currentTenant!,
                                                            'calendar:edit'
                                                        ) ||
                                                            event.authorId ===
                                                                authData?._id) &&
                                                            props.onEdit && (
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    onClick={() =>
                                                                        props.onEdit?.(
                                                                            event
                                                                        )
                                                                    }
                                                                >
                                                                    <IconEdit />
                                                                </ActionIcon>
                                                            )}
                                                        {(checkPermission(
                                                            currentTenant!,
                                                            'calendar:delete'
                                                        ) ||
                                                            event.authorId ===
                                                                authData?._id) &&
                                                            props.onDelete && (
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="gray"
                                                                    onClick={() =>
                                                                        props.onDelete?.(
                                                                            event._id
                                                                        )
                                                                    }
                                                                >
                                                                    <IconTrash />
                                                                </ActionIcon>
                                                            )}
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        </Flex>
                                    );
                                }
                            })}
                        {props.events.filter((event) =>
                            selected
                                ? dayjs(event.startDate).isSame(selected, 'day')
                                : dayjs(event.startDate).isAfter(new Date())
                        ).length === 0 && (
                            <Text size="sm" mt="sm" c="dimmed">
                                {t('DASHBOARD.CALENDAR_EMPTY_DAY')}
                            </Text>
                        )}
                    </Flex>
                </SimpleGrid>
            </Card.Section>
        </Card>
    );
};

export default CalendarCard;
