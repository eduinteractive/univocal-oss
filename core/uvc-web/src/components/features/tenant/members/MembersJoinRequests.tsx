import { TenantRequest } from '@eduinteractive/uvc-api';
import { ActionIcon, Divider, Group, Table, Title } from '@mantine/core';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { IconCheck, IconX } from '@tabler/icons-react';
import SVHSortTable from '../../../common/SVHSortTable';
import { useTranslation } from 'react-i18next';

interface MembersJoinRequestsProps {
    requests: TenantRequest[];
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
}

const MembersJoinRequests = (props: MembersJoinRequestsProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();

    if (!checkPermission(currentTenant!, 'member:administration')) {
        return null;
    }

    if (!props.requests.length) {
        return null;
    }

    return (
        <>
            <Divider my="md" />
            <Title order={6} c="dimmed" mb="xs">
                {t('MEMBERS.REQUESTS.TITLE')}
            </Title>
            <SVHSortTable<TenantRequest>
                columns={[
                    { key: 'mail', label: t('MEMBERS.REQUESTS.EMAIL') },
                    { key: 'date', label: t('MEMBERS.REQUESTS.REQUESTED_AT') },
                    {
                        key: 'actions',
                        label: t('MEMBERS.REQUESTS.ACTIONS'),
                        sortable: false,
                    },
                ]}
                data={props.requests}
                renderRow={(row) => (
                    <Table.Tr key={row._id}>
                        <Table.Td>{row.mail}</Table.Td>
                        <Table.Td>{new Date(row.date).toLocaleString()}</Table.Td>
                        <Table.Td>
                            <Group gap="xs">
                                <ActionIcon
                                    variant="subtle"
                                    color="green"
                                    title={t('MEMBERS.REQUESTS.ACCEPT')}
                                    aria-label={t('MEMBERS.REQUESTS.ACCEPT')}
                                    onClick={() => props.onAccept(row._id)}
                                >
                                    <IconCheck size={22} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    title={t('MEMBERS.REQUESTS.REJECT')}
                                    aria-label={t('MEMBERS.REQUESTS.REJECT')}
                                    onClick={() => props.onReject(row._id)}
                                >
                                    <IconX size={22} />
                                </ActionIcon>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                )}
            />
        </>
    );
};

export default MembersJoinRequests;
