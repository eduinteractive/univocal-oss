import { ActionIcon, Button, Fieldset, Group, Table } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import TenantMemberModal, { TenantMemberModalSubmit } from './TenantMemberModal';
import { useState } from 'react';
import { TenantUser, User } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';
import { getMemberRoleLabel } from '../../../utils/Parser';

interface TenantMembersProps {
    allUsers: User[];
    users: TenantUser[];
    onUpdate: (values: TenantMemberModalSubmit) => void;
    onAdd: (values: TenantMemberModalSubmit) => void;
    onDelete: (id: string) => void;
}

const TenantMembers = (props: TenantMembersProps) => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);

    return (
        <Fieldset legend={t("ADMIN.MEMBER_TITLE")} mt="md" mb="md">
            <TenantMemberModal
                key={currentUser?._id ?? 'add'}
                modalVisible={modalVisible}
                users={props.allUsers}
                user={currentUser}
                onClose={() => setModalVisible(false)}
                onSubmit={(values) => {
                    if (currentUser) {
                        props.onUpdate({
                            mail: currentUser._id,
                            permissionLevel: values.permissionLevel,
                        });
                    } else {
                        props.onAdd({
                            mail: values.mail,
                            permissionLevel: values.permissionLevel,
                        });
                    }
                    setModalVisible(false);
                }}
            />
            <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Gruppenberechtigung</Table.Th>
                        <Table.Th>Aktionen</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {props.users.map((user) => (
                        <Table.Tr key={user._id}>
                            <Table.Td>
                                {user.firstName} {user.lastName}
                            </Table.Td>
                            <Table.Td>
                                {getMemberRoleLabel(user.group_permission)}
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon
                                    variant="subtle"
                                    color="blue"
                                    onClick={() => {
                                        setCurrentUser(user);
                                        setModalVisible(true);
                                    }}
                                >
                                    <IconEdit />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="red"
                                onClick={() => props.onDelete(user._id)}>
                                    <IconTrash />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    { props.users.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={3}>
                                {t("COMMON.DATA_EMPTY")}
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
            <Group justify="right" mt="md">
                <Button
                    color="blue"
                    variant="outline"
                    onClick={() => {
                        setCurrentUser(null);
                        setModalVisible(true);
                    }}
                >
                    {t("ADMIN.MEMBER_CREATE")}
                </Button>
            </Group>
        </Fieldset>
    );
};

export default TenantMembers;
