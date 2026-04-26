import { ActionIcon, Button, Group, Table } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import DomainModal from './DomainModal';
import { Domain } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface DomainTableProps {
    domains: Domain[];
    onDelete: (id: string) => void;
    onAdd: (domain: Domain) => void;
    onUpdate: (domain: Domain) => void;
}

const DomainTable = (props: DomainTableProps) => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

    return (
        <>
            <Group justify="right" mb="sm">
                <Button
                    onClick={() => {
                        setSelectedDomain(null);
                        setModalVisible(true);
                    }}
                >
                    Domain hinzufügen
                </Button>
            </Group>
            <Table withColumnBorders withTableBorder>
                <DomainModal
                    domain={selectedDomain}
                    modalVisible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedDomain(null);
                    }}
                    onSave={(domain) => {
                        setModalVisible(false);
                        setSelectedDomain(null);
                        if (domain._id === '') {
                            props.onAdd(domain);
                        } else {
                            props.onUpdate(domain);
                        }
                    }}
                />
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("COMMON.ATTRIBUTES.TITLE")}</Table.Th>
                        <Table.Th>{t("ADMIN.ATTRIBUTES.SHORTCODE")}</Table.Th>
                        <Table.Th>{t("COMMON.ACTIONS")}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {props.domains.map((domain) => (
                        <Table.Tr key={domain._id}>
                            <Table.Td>{domain.title}</Table.Td>
                            <Table.Td>{domain.shortcode}</Table.Td>
                            <Table.Td>
                                <ActionIcon
                                    color="blue"
                                    variant="subtle"
                                    size="md"
                                    onClick={() => {
                                        setSelectedDomain(domain);
                                        setModalVisible(true);
                                    }}
                                >
                                    <IconEdit />
                                </ActionIcon>
                                <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    size="md"
                                    onClick={() => props.onDelete(domain._id)}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {props.domains.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={3}>
                                {t("COMMON.DATA_EMPTY")}
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </>
    );
};

export default DomainTable;
