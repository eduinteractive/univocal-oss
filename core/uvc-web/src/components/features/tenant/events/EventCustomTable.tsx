import { Table } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SVHEventAttendee, SVHEventRegistration } from '@eduinteractive/uvc-api';

interface EventCustomTableProps {
    fields: {
        key: string;
    }[];
    data: (SVHEventAttendee | SVHEventRegistration)[];
}

const EventCustomTable = (props: EventCustomTableProps) => {
    const { t } = useTranslation();

    const isBase64 = (str: string) => {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    };

    return (
        <Table withColumnBorders withRowBorders withTableBorder>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{t('EVENTS.TABLE.NAME')}</Table.Th>
                    <Table.Th>{t('EVENTS.TABLE.EMAIL')}</Table.Th>
                    {props.fields?.map((field) => (
                        <Table.Th key={field.key}>{atob(field.key)}</Table.Th>
                    ))}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {props.data.map((attendee) => (
                    <Table.Tr key={attendee._id}>
                        <Table.Td>
                            {attendee.personal.firstName}{' '}
                            {attendee.personal.lastName}
                        </Table.Td>
                        <Table.Td>{attendee.personal.email}</Table.Td>
                        {props.fields?.map((field) => {
                            let value = '-';
                            if (
                                attendee.customFields &&
                                attendee.customFields[field.key]
                            ) {
                                const customField =
                                    attendee.customFields[field.key];

                                if (typeof customField === 'string') {
                                    // Prüfe ob der String Base64-codiert ist
                                    if (isBase64(customField)) {
                                        value = atob(customField);
                                    } else {
                                        value = customField;
                                    }
                                } else if (Array.isArray(customField)) {
                                    // Prüfe jedes Element im Array
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
                    </Table.Tr>
                ))}
                {props.data.length === 0 && (
                    <Table.Tr>
                        <Table.Td colSpan={2}>
                            {t('EVENTS.TABLE.EMPTY')}
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
        </Table>
    );
};

export default EventCustomTable;
