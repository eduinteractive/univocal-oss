import { Button, Group, Table, Text } from '@mantine/core';
import { CalendarEvent } from '@eduinteractive/uvc-api';
import { useTenant } from '../../../../context/TenantContext';
import CalendarMaterials from './CalendarMaterials';
import dayjs from 'dayjs';
import { EDIModal } from '@eduinteractive/mantine-common';
import { checkPermission } from '../../../../utils/Permission';
import { useAuth } from '../../../../context/AuthContext';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { getMemberRoleLabel } from '../../../../utils/Parser';
import { useTranslation } from 'react-i18next';

interface CalendarViewModalProps {
    event: CalendarEvent | null;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const CalendarViewModal = (props: CalendarViewModalProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const { authData } = useAuth();

    if (!props.event) return null;

    return (
        <EDIModal
            title={t('CALENDAR.EVENT_DETAILS')}
            type="ALERT"
            visible={props.event !== null}
            onClose={props.onClose}
            size="lg"
        >
            <Table mb="md">
                <Table.Tr>
                    <Table.Th>{t('CALENDAR.TABLE_TITLE')}</Table.Th>
                    <Table.Td>{props.event.title}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('CALENDAR.TABLE_DATE')}</Table.Th>
                    <Table.Td>
                        {dayjs(props.event.startDate).format(
                            'DD.MM.YYYY HH:mm'
                        )}{' '}
                        -{' '}
                        {props.event.endDate &&
                            dayjs(props.event.endDate).format(
                                'DD.MM.YYYY HH:mm'
                            )}
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('CALENDAR.TABLE_LOCATION')}</Table.Th>
                    <Table.Td>{props.event.location}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('CALENDAR.TABLE_VIEW_ACCESS')}</Table.Th>
                    {!Number.isNaN(props.event.viewAccess) && (
                        <Table.Td>
                            {
                                getMemberRoleLabel(props.event!.viewAccess)
                            }
                        </Table.Td>
                    )}
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('CALENDAR.TABLE_DESCRIPTION')}</Table.Th>
                    <Table.Td>{props.event.description}</Table.Td>
                </Table.Tr>
            </Table>
            {props.event.materials.length > 0 && (
                <CalendarMaterials
                    materials={props.event.materials}
                    onDownload={(link) => {
                        window.open(
                            `${
                                import.meta.env.VITE_KUBERNETES_HOST
                            }/api/calendar/tenant/${currentTenant?._id}/event/${
                                props.event?._id
                            }/download/${encodeURIComponent(link)}`,
                            '_blank'
                        );
                    }}
                />
            )}
            <Text c="dimmed" size="sm" mb={5} mt="xs">
                {t('CALENDAR.FUNCTIONS_TITLE')}
            </Text>
            <Group gap="xs">
                <Button
                    variant="default"
                    onClick={() =>
                        window.open(
                            `${
                                import.meta.env.VITE_KUBERNETES_HOST
                            }/api/calendar/tenant/${currentTenant?._id}/calendar/${
                                props.event?._id
                            }`,
                            '_blank'
                        )
                    }
                >
                    {t('CALENDAR.FUNCTION_EXPORT')}
                </Button>
                {(checkPermission(currentTenant!, 'calendar:edit') ||
                    props.event.authorId === authData?._id) && (
                    <>
                        {props.onEdit && (
                            <Button variant="default" onClick={props.onEdit}>
                                <IconEdit size={24} />
                                {t('COMMON.EDIT')}
                            </Button>
                        )}
                        {props.onDelete && (
                            <Button variant="default" onClick={props.onDelete}>
                                <IconTrash size={24} />
                                {t('COMMON.DELETE')}
                            </Button>
                        )}
                    </>
                )}
            </Group>
        </EDIModal>
    );
};

export default CalendarViewModal;
