/* eslint-disable react-refresh/only-export-components */
import { Button, Flex, Group, Popover, SimpleGrid, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { CalendarEvent } from '@eduinteractive/uvc-api';
import CalendarViewModal from './CalendarViewModal';
import CalendarEventModal, {
    CalendarEventSubmitProps,
} from './CalendarEventModal';
import { EDIModal } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

export const CALENDAR_WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const CALENDAR_MONTHS = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
];

const MAX_EVENTS_PER_DAY = 2;

interface CalendarRasterProps {
    events: CalendarEvent[];
    month: number;
    year: number;
    onSave: (data: CalendarEventSubmitProps) => void;
    onDelete: (eventId: string) => void;
}

const CalendarRaster = (props: CalendarRasterProps) => {
    const { t } = useTranslation();
    const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(
        null
    );
    const [isEventEditing, setIsEventEditing] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [calendarDays, setCalendarDays] = useState<Date[]>([]);
    const [popoverOpened, setPopoverOpened] = useState<boolean[]>([]);
    const [calendarDeleteId, setCalendarDeleteId] = useState<string | null>(
        null
    );

    useEffect(() => {
        const startOfMonth = new Date(props.year, props.month, 1);

        let weekday = startOfMonth.getDay();
        if (weekday === 0) {
            weekday = 7;
        }

        startOfMonth.setDate(startOfMonth.getDate() - (weekday - 1));

        const days = [];
        for (let i = 0; i < 42; i++) {
            days.push(new Date(startOfMonth));
            startOfMonth.setDate(startOfMonth.getDate() + 1);
        }

        setCalendarDays(days);
        setPopoverOpened(new Array(days.length).fill(false));
    }, [props.year, props.month]);

    return (
        <Flex direction="column">
            <CalendarViewModal
                event={!isEventEditing ? currentEvent : null}
                onClose={() => setCurrentEvent(null)}
                onDelete={() => {
                    setCalendarDeleteId(currentEvent!._id);
                    setCurrentEvent(null);
                }}
                onEdit={() => setIsEventEditing(true)}
            />
            <CalendarEventModal
                event={currentEvent || undefined}
                inferStartDate={selectedDate || new Date()}
                visible={selectedDate !== null || isEventEditing}
                onClose={() => {
                    setSelectedDate(null);
                    setCurrentEvent(null);
                    setIsEventEditing(false);
                }}
                onSave={(data) => {
                    props.onSave(data);
                    setSelectedDate(null);
                    setCurrentEvent(null);
                    setIsEventEditing(false);
                }}
            />
            <EDIModal
                visible={calendarDeleteId !== null}
                title={t('CALENDAR.EVENT_DELETE')}
                type="CONFIRM"
                onClose={() => setCalendarDeleteId(null)}
                onSubmit={() => {
                    props.onDelete(calendarDeleteId!);
                    setCalendarDeleteId(null);
                }}
            >
                <Text size="sm">
                    {t('CALENDAR.EVENT_DELETE_DESCRIPTION')}
                </Text>
            </EDIModal>
            <SimpleGrid cols={7} spacing={0} pb="lg">
                {calendarDays.map((day, index) => {
                    // Alle Events für diesen Tag herausfiltern
                    const dayEvents = props.events.filter((event) => {
                        // Start- und Enddatum holen und beide auf Mitternacht setzen
                        let start = new Date(event.startDate);
                        start.setHours(0, 0, 0, 0);

                        let end = new Date(event.endDate || event.startDate);
                        end.setHours(0, 0, 0, 0);

                        // Falls ein Termin-Ende vor dem -Start liegt, einmal umdrehen
                        if (end < start) {
                            [start, end] = [end, start];
                        }

                        // Auch den aktuellen Tag auf Mitternacht setzen
                        const currentDay = new Date(day);
                        currentDay.setHours(0, 0, 0, 0);

                        // Prüfen, ob currentDay zwischen start und end liegt (inklusive)
                        return currentDay >= start && currentDay <= end;
                    });

                    return (
                        <Flex
                            direction="column"
                            key={index}
                            style={{
                                border: '1px solid #ccc',
                                overflow: 'hidden',
                            }}
                            h="calc(85vh / 6)"
                            mih={100}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(day);
                            }}
                            bg={
                                day.getMonth() !== props.month
                                    ? 'gray.0'
                                    : 'white'
                            }
                        >
                            {index < 7 && (
                                <Text
                                    ta="center"
                                    size="xs"
                                    c="dimmed"
                                    mt={5}
                                    pb={0}
                                >
                                    {CALENDAR_WEEKDAYS[index]}
                                </Text>
                            )}
                            <Text
                                ta="center"
                                size="xs"
                                mt={index < 7 ? 0 : 5}
                                c={
                                    day.getMonth() !== props.month
                                        ? 'dimmed'
                                        : undefined
                                }
                            >
                                {day.getDate()}
                                {day.getDate() === 1
                                    ? '. ' + CALENDAR_MONTHS[day.getMonth()]
                                    : ''}
                            </Text>
                            {dayEvents
                                .sort(
                                    (a, b) =>
                                        new Date(a.startDate).getTime() -
                                        new Date(b.startDate).getTime()
                                )
                                .slice(0, MAX_EVENTS_PER_DAY)
                                .map((event) => (
                                    <Group justify="center" key={event._id}>
                                        <Button
                                            h={17.5}
                                            w="95%"
                                            mt={0}
                                            px={4}
                                            mb={2}
                                            color={event.color || 'blue'}
                                            justify="flex-start"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentEvent(event);
                                            }}
                                        >
                                            <Text size="xs">
                                                {new Date(
                                                    event.startDate
                                                ).toLocaleTimeString('de-DE', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                {' ' + event.title}
                                            </Text>
                                        </Button>
                                    </Group>
                                ))}
                            {dayEvents.length > MAX_EVENTS_PER_DAY && (
                                <Popover
                                    width={200}
                                    position="bottom"
                                    withArrow
                                    shadow="md"
                                    opened={popoverOpened[index]}
                                    onClose={() => {
                                        const newPopoverOpened = [
                                            ...popoverOpened,
                                        ];
                                        newPopoverOpened[index] = false;
                                        setPopoverOpened(newPopoverOpened);
                                    }}
                                >
                                    <Popover.Target>
                                        <Group justify="center">
                                            <Button
                                                variant="subtle"
                                                h={17.5}
                                                size="xs"
                                                mt={2}
                                                w="95%"
                                                px={4}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newPopoverOpened = [
                                                        ...popoverOpened,
                                                    ];
                                                    newPopoverOpened[index] =
                                                        true;
                                                    setPopoverOpened(
                                                        newPopoverOpened
                                                    );
                                                }}
                                            >
                                                +{' '}
                                                {dayEvents.length -
                                                    MAX_EVENTS_PER_DAY}{' '}
                                                {t('COMMON.MORE').toLowerCase()}
                                            </Button>
                                        </Group>
                                    </Popover.Target>
                                    <Popover.Dropdown>
                                        {dayEvents
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        a.startDate
                                                    ).getTime() -
                                                    new Date(
                                                        b.startDate
                                                    ).getTime()
                                            )
                                            .slice(MAX_EVENTS_PER_DAY)
                                            .map((event) => (
                                                <Group
                                                    justify="center"
                                                    key={event._id}
                                                >
                                                    <Button
                                                        h={17.5}
                                                        w="95%"
                                                        mt={0}
                                                        px={4}
                                                        mb={2}
                                                        color={
                                                            event.color ||
                                                            'blue'
                                                        }
                                                        justify="flex-start"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentEvent(
                                                                event
                                                            );
                                                        }}
                                                    >
                                                        <Text size="xs">
                                                            {new Date(
                                                                event.startDate
                                                            ).toLocaleTimeString(
                                                                'de-DE',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                }
                                                            )}
                                                            {' ' + event.title}
                                                        </Text>
                                                    </Button>
                                                </Group>
                                            ))}
                                    </Popover.Dropdown>
                                </Popover>
                            )}
                        </Flex>
                    );
                })}
            </SimpleGrid>
        </Flex>
    );
};

export default CalendarRaster;
