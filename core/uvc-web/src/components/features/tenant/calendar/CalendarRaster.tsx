import { Button, Flex, Popover, Text } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useState } from 'react';
import { CalendarEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import CalendarViewModal from './CalendarViewModal';
import CalendarEventModal, {
    CalendarEventSubmitProps,
} from './CalendarEventModal';
import { EDIModal } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

const MAX_EVENTS_PER_DAY = 2;

export const eventCoversDay = (event: CalendarEvent, day: string | Date) => {
    let start = dayjs(event.startDate).startOf('day');
    let end = dayjs(event.endDate || event.startDate).startOf('day');
    if (end.isBefore(start)) {
        const swap = start;
        start = end;
        end = swap;
    }
    const current = dayjs(day).startOf('day');
    return !current.isBefore(start) && !current.isAfter(end);
};

interface CalendarRasterProps {
    events: CalendarEvent[];
    date: Date;
    onDateChange: (date: Date) => void;
    onSave: (data: CalendarEventSubmitProps) => void;
    onDelete: (eventId: string) => void;
}

const eventLabel = (event: CalendarEvent) =>
    `${new Date(event.startDate).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    })} ${event.title}`;

const CalendarRaster = (props: CalendarRasterProps) => {
    const { t } = useTranslation();
    const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(
        null
    );
    const [isEventEditing, setIsEventEditing] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [moreDate, setMoreDate] = useState<string | null>(null);
    const [calendarDeleteId, setCalendarDeleteId] = useState<string | null>(
        null
    );

    const applyDate = (value: string) => {
        props.onDateChange(dayjs(value).toDate());
    };

    const eventsOnDay = (day: string) =>
        props.events
            .filter((event) => eventCoversDay(event, day))
            .sort(
                (a, b) =>
                    new Date(a.startDate).getTime() -
                    new Date(b.startDate).getTime()
            );

    const renderEventButton = (event: CalendarEvent) => (
        <Button
            key={event._id}
            h={17.5}
            w="100%"
            px={4}
            mb={2}
            color={event.color || 'violet'}
            justify="flex-start"
            onClick={(eventClick) => {
                eventClick.stopPropagation();
                setMoreDate(null);
                setCurrentEvent(event);
            }}
        >
            <Text size="xs" truncate>
                {eventLabel(event)}
            </Text>
        </Button>
    );

    return (
        <Flex direction="column" pb="lg">
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
                <Text size="sm">{t('CALENDAR.EVENT_DELETE_DESCRIPTION')}</Text>
            </EDIModal>
            <Calendar
                static
                fullWidth
                highlightToday
                withCellSpacing={false}
                date={props.date}
                onDateChange={applyDate}
                onNextMonth={applyDate}
                onPreviousMonth={applyDate}
                getDayProps={(day) => ({
                    onClick: () => setSelectedDate(dayjs(day).toDate()),
                })}
                styles={{
                    levelsGroup: { width: '100%', maxWidth: 'unset' },
                    calendarHeader: {
                        width: '100%',
                        maxWidth: 'unset',
                        marginBottom: 8,
                    },
                    month: { width: '100%', tableLayout: 'fixed' },
                    monthCell: {
                        height: 'calc(85vh / 6)',
                        minHeight: 100,
                        padding: 0,
                        border: '1px solid var(--mantine-color-gray-3)',
                        verticalAlign: 'top',
                    },
                    day: {
                        width: '100%',
                        height: 'calc(85vh / 6)',
                        minHeight: 100,
                        borderRadius: 0,
                        aspectRatio: 'auto',
                        alignItems: 'stretch',
                        justifyContent: 'flex-start',
                        padding: 4,
                        cursor: 'pointer',
                        overflow: 'hidden',
                    },
                }}
                renderDay={(day) => {
                    const dayEvents = eventsOnDay(day);
                    const hiddenEvents = dayEvents.slice(MAX_EVENTS_PER_DAY);
                    return (
                        <Flex direction="column" w="100%" gap={0}>
                            <Text
                                ta="center"
                                size="xs"
                                c={
                                    dayjs(day).isSame(props.date, 'month')
                                        ? undefined
                                        : 'dimmed'
                                }
                            >
                                {dayjs(day).date()}
                            </Text>
                            {dayEvents
                                .slice(0, MAX_EVENTS_PER_DAY)
                                .map(renderEventButton)}
                            {hiddenEvents.length > 0 && (
                                <Popover
                                    width={200}
                                    position="bottom"
                                    withArrow
                                    shadow="md"
                                    opened={moreDate === day}
                                    onClose={() => setMoreDate(null)}
                                >
                                    <Popover.Target>
                                        <Button
                                            variant="subtle"
                                            h={17.5}
                                            size="xs"
                                            w="100%"
                                            px={4}
                                            onClick={(click) => {
                                                click.stopPropagation();
                                                setMoreDate(day);
                                            }}
                                        >
                                            + {hiddenEvents.length}{' '}
                                            {t('COMMON.MORE').toLowerCase()}
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown>
                                        <Flex direction="column">
                                            {hiddenEvents.map(renderEventButton)}
                                        </Flex>
                                    </Popover.Dropdown>
                                </Popover>
                            )}
                        </Flex>
                    );
                }}
            />
        </Flex>
    );
};

export default CalendarRaster;
