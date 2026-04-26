import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { CalendarEvent } from '@eduinteractive/uvc-api';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { checkPermission } from '../../../../utils/Permission';
import dayjs from 'dayjs';
import { useState } from 'react';
import CalendarViewModal from './CalendarViewModal';
import { EDIModal } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface CalendarTableProps {
    events: CalendarEvent[];
    onEdit: (event: CalendarEvent) => void;
    onDelete: (eventId: string) => void;
}

const CalendarTable = (props: CalendarTableProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );
    const [calendarDeleteId, setCalendarDeleteId] = useState<string | null>(
        null
    );

    return (
        <Table withRowBorders withTableBorder>
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
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{t('CALENDAR.TABLE_TITLE')}</Table.Th>
                    <Table.Th>{t('CALENDAR.TABLE_DESCRIPTION')}</Table.Th>
                    <Table.Th>{t('CALENDAR.TABLE_DATE')}</Table.Th>
                    <Table.Th>{t('CALENDAR.TABLE_ACTIONS')}</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                <CalendarViewModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
                {props.events.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((event) => (
                    <Table.Tr key={event._id}>
                        <Table.Td>{event.title}</Table.Td>
                        <Table.Td>{event.description}</Table.Td>
                        <Table.Td>
                            {dayjs(event.startDate).format('DD.MM.YYYY HH:mm')}{' '}
                            -{' '}
                            {event.endDate &&
                                dayjs(event.endDate).format('DD.MM.YYYY HH:mm')}
                        </Table.Td>
                        <Table.Td>
                            <Group gap="sm" align="center">
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    <IconEye size={24} />
                                </ActionIcon>
                                {(checkPermission(
                                    currentTenant!,
                                    'calendar:edit'
                                ) ||
                                    event.authorId === authData?._id) && (
                                    <>
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={() => props.onEdit(event)}
                                        >
                                            <IconEdit size={24} />
                                        </ActionIcon>

                                        <ActionIcon
                                            variant="subtle"
                                            color="gray"
                                            onClick={() =>
                                                setCalendarDeleteId(event._id)
                                            }
                                        >
                                            <IconTrash size={24} />
                                        </ActionIcon>
                                    </>
                                )}
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
                {props.events.length === 0 && (
                    <Table.Tr>
                        <Table.Td colSpan={4}>
                            <Text ta="center" c="dimmed" size="sm">
                                {t('COMMON.DATA_EMPTY')}
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
        </Table>
    );
};

export default CalendarTable;
