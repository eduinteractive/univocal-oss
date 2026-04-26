import { EDIModal } from '@eduinteractive/mantine-common';
import { Table } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export interface ContactMultipleModalSubmit {
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    description?: string;
    street?: string;
    zip?: string;
    city?: string;
}

interface ContactMultipleModalProps {
    data: ContactMultipleModalSubmit[];
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: ContactMultipleModalSubmit[]) => void;
}

const ContactMultipleModal = (props: ContactMultipleModalProps) => {
    const { t } = useTranslation();
    const handleSubmit = () => {
        props.onSubmit(props.data);
    };

    return (
        <EDIModal
            visible={props.visible}
            title={t('KNOWLEDGE.CONTACT.ADD_MULTIPLE')}
            type="DEFAULT"
            onClose={() => props.onClose()}
            onSubmit={handleSubmit}
            isForm
        >
            <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                withRowBorders
            >
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('KNOWLEDGE.CONTACT.TABLE.TITLE')}</Table.Th>
                        <Table.Th>{t('KNOWLEDGE.CONTACT.TABLE.FIRST_NAME')}</Table.Th>
                        <Table.Th>{t('KNOWLEDGE.CONTACT.TABLE.LAST_NAME')}</Table.Th>
                        <Table.Th>{t('KNOWLEDGE.CONTACT.TABLE.EMAIL')}</Table.Th>
                        <Table.Th>{t('COMMON.ADDRESS.PHONE')}</Table.Th>
                        <Table.Th>{t('COMMON.ADDRESS.ADDRESS')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {props.data.map((item, index) => (
                        <Table.Tr key={'new_contact' + index}>
                            <Table.Td>{item.title}</Table.Td>
                            <Table.Td>{item.firstName}</Table.Td>
                            <Table.Td>{item.lastName}</Table.Td>
                            <Table.Td>{item.email}</Table.Td>
                            <Table.Td>{item.phone}</Table.Td>
                            <Table.Td>
                                {item.street} {item.zip} {item.city}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </EDIModal>
    );
};

export default ContactMultipleModal;
