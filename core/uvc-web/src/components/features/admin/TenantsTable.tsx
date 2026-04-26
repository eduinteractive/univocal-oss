import { ActionIcon, Table } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import TenantModal, { TenantModalSubmitData } from './TenantModal';
import { useNavigate } from 'react-router-dom';
import useDomains from '../../../hooks/useDomains';
import { Domain, Tenant } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface TenantsTableProps {
    tenants: Tenant[];
    onDelete: (_id: string) => void;
    onUpdate: (tenantId: string, tenant: TenantModalSubmitData) => void;
}

const TenantsTable = (props: TenantsTableProps) => {
    const { t } = useTranslation();
    const domains = useDomains();
    const navigate = useNavigate();
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

    return (
        <Table striped withTableBorder withColumnBorders>
            <TenantModal
                domains={domains}
                tenant={currentTenant ?? undefined}
                modalVisible={Boolean(currentTenant)}
                onClose={() => setCurrentTenant(null)}
                onSubmit={(tenant) => {
                    props.onUpdate(currentTenant!._id, tenant);
                    setCurrentTenant(null);
                }}
            />
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{t('ADMIN.TENANT_TABLE_NAME')}</Table.Th>
                    <Table.Th>{t('ADMIN.ATTRIBUTES.DOMAIN')}</Table.Th>
                    <Table.Th>{t('COMMON.ACTIONS')}</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {props.tenants.map((tenant) => {
                    return (
                        <Table.Tr key={tenant._id}>
                            <Table.Td>{tenant.title}</Table.Td>
                            <Table.Td>
                                {(tenant.domain as Domain)?.shortcode}
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon
                                    c="blue.7"
                                    variant="subtle"
                                    mr="sm"
                                    onClick={() =>
                                        navigate(`/admin/tenants/${tenant._id}`)
                                    }
                                >
                                    <IconEdit />
                                </ActionIcon>
                                <ActionIcon
                                    c="red.7"
                                    variant="subtle"
                                    onClick={() => props.onDelete(tenant._id)}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>
    );
};

export default TenantsTable;
