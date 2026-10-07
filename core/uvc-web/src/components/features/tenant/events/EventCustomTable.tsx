import { ActionIcon, Table } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SVHEventAttendee, SVHEventRegistration } from '@eduinteractive/uvc-api';
import { EDIDeleteDialog } from '@eduinteractive/mantine-common';
import { IconTrash } from '@tabler/icons-react';

interface EventCustomTableProps {
    fields: {
        key: string;
    }[];
    data: (SVHEventAttendee | SVHEventRegistration)[];
    onDelete?: (id: string) => void;
}

const EventCustomTable = (props: EventCustomTableProps) => {
    const { t } = useTranslation();
    const [pendingId, setPendingId] = useState<string | null>(null);
    const columnCount =
        2 + (props.fields?.length ?? 0) + (props.onDelete ? 1 : 0);

    const isBase64 = (str: string) => {
        try {
            return btoa(atob(str)) === str;
        } catch {
            return false;
        }
    };

    return (
        <>
            <EDIDeleteDialog
                title={t('EVENTS.TABLE.DELETE')}
                description={t('EVENTS.TABLE.DELETE_DESCRIPTION')}
                visible={pendingId !== null}
                onClose={() => setPendingId(null)}
                onSubmit={() => {
                    if (pendingId && props.onDelete) {
                        props.onDelete(pendingId);
                    }
                    setPendingId(null);
                }}
            />
            <Table withColumnBorders withRowBorders withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('EVENTS.TABLE.NAME')}</Table.Th>
                        <Table.Th>{t('EVENTS.TABLE.EMAIL')}</Table.Th>
                        {props.fields?.map((field) => (
                            <Table.Th key={field.key}>{atob(field.key)}</Table.Th>
                        ))}
                        {props.onDelete && <Table.Th w={52} />}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {props.data.map((entry) => (
                        <Table.Tr key={entry._id}>
                            <Table.Td>
                                {entry.personal.firstName}{' '}
                                {entry.personal.lastName}
                            </Table.Td>
                            <Table.Td>{entry.personal.email}</Table.Td>
                            {props.fields?.map((field) => {
                                let value = '-';
                                if (
                                    entry.customFields &&
                                    entry.customFields[field.key]
                                ) {
                                    const customField =
                                        entry.customFields[field.key];

                                    if (typeof customField === 'string') {
                                        if (isBase64(customField)) {
                                            value = atob(customField);
                                        } else {
                                            value = customField;
                                        }
                                    } else if (Array.isArray(customField)) {
                                        value = customField
                                            .map((val) =>
                                                isBase64(val)
                                                    ? atob(val)
                                                    : val
                                            )
                                            .join(', ');
                                    }
                                }
                                return <Table.Td key={field.key}>{value}</Table.Td>;
                            })}
                            {props.onDelete && (
                                <Table.Td>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        aria-label={t('EVENTS.TABLE.DELETE')}
                                        onClick={() => setPendingId(entry._id)}
                                    >
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Table.Td>
                            )}
                        </Table.Tr>
                    ))}
                    {props.data.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={columnCount}>
                                {t('EVENTS.TABLE.EMPTY')}
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </>
    );
};

export default EventCustomTable;
