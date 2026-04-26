import { ActionIcon, Button, Group, Table } from '@mantine/core';
import { Tenant } from '@eduinteractive/uvc-api';
import TenantModal, { TenantModalSubmitData } from '../admin/TenantModal';
import { useState } from 'react';
import { IconEdit, IconUserPlus } from '@tabler/icons-react';
import { MemberModalSubmitData } from '../tenant/members/MemberModal';
import DomainMemberModal from './DomainMemberModal';
import { useTranslation } from 'react-i18next';

interface DomainNetworksProps {
    data: Tenant[];
    onCreate: (data: TenantModalSubmitData) => void;
    onUpdate: (tenantId: string, data: TenantModalSubmitData) => void;
    onMemberAdd: (tenantId: string, data: MemberModalSubmitData) => void;
}

const DomainNetworks = (props: DomainNetworksProps) => {
    const { t } = useTranslation();
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [tenantModalVisible, setTenantModalVisible] = useState(false);
    const [memberModalVisible, setMemberModalVisible] = useState(false);

    return (
        <>
            <Group justify="right" mb="sm">
                <Button size="sm" onClick={() => setTenantModalVisible(true)}>
                    {t("ADMIN.TENANT_CREATE")}
                </Button>
            </Group>
            <Table striped withTableBorder withColumnBorders>
                <TenantModal
                    tenant={currentTenant ?? undefined}
                    modalVisible={tenantModalVisible}
                    onClose={() => {
                        setCurrentTenant(null);
                        setTenantModalVisible(false);
                    }}
                    onSubmit={(data) => {
                        if (!currentTenant) {
                            props.onCreate(data);
                        } else {
                            props.onUpdate(currentTenant!._id, data);
                        }
                        setCurrentTenant(null);
                        setTenantModalVisible(false);
                    }}
                />
                <DomainMemberModal
                    visible={memberModalVisible}
                    onClose={() => {
                        setMemberModalVisible(false);
                        setCurrentTenant(null);
                    }}
                    onSave={(data) => {
                        props.onMemberAdd(currentTenant!._id, data);
                        setMemberModalVisible(false);
                        setCurrentTenant(null);
                    }}
                />
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("ADMIN.TENANT_TABLE_NAME")}</Table.Th>
                        <Table.Th>{t("ADMIN.TENANT_TABLE_VISIBILITY")}</Table.Th>
                        <Table.Th>{t("COMMON.ACTIONS")}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {props.data.map((tenant) => {
                        return (
                            <Table.Tr key={tenant._id}>
                                <Table.Td>{tenant.title}</Table.Td>
                                <Table.Td>
                                    {tenant.visibility === "PUBLIC"
                                        ? t("ADMIN.TENANT_VISIBILITY_PUBLIC")
                                        : tenant.visibility === "ON_REQUEST"
                                          ? t("ADMIN.TENANT_VISIBILITY_ON_REQUEST")
                                          : t("ADMIN.TENANT_VISIBILITY_HIDDEN")}
                                </Table.Td>
                                <Table.Td>
                                    <ActionIcon
                                        c="blue.7"
                                        variant="subtle"
                                        mr="sm"
                                        onClick={() => {
                                            setCurrentTenant(tenant);
                                            setMemberModalVisible(true);
                                        }}
                                    >
                                        <IconUserPlus />
                                    </ActionIcon>
                                    <ActionIcon
                                        c="blue.7"
                                        variant="subtle"
                                        mr="sm"
                                        onClick={() => {
                                            setCurrentTenant(tenant);
                                            setTenantModalVisible(true);
                                        }}
                                    >
                                        <IconEdit />
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </>
    );
};

export default DomainNetworks;
