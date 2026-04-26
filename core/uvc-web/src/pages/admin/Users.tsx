import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { ActionIcon, Flex, Select, Table, Text, TextInput } from '@mantine/core';
import { Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { useNavigate } from 'react-router-dom';
import { IconEdit } from '@tabler/icons-react';
import { ActivationStatus, User } from '@eduinteractive/uvc-api';

const AdminUsers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const usersQuery = useQuery({
        queryKey: ['admin-users'],
        queryFn: SAPI.AUTH.ADMIN.getUsers,
    });

    const filteredUsers = useMemo(() => {
        if (!usersQuery.data) return [];
        let list = usersQuery.data;
        const searchLower = search.trim().toLowerCase();
        if (searchLower) {
            list = list.filter(
                (u: User) =>
                    u.mail?.toLowerCase().includes(searchLower) ||
                    u.firstName?.toLowerCase().includes(searchLower) ||
                    u.lastName?.toLowerCase().includes(searchLower)
            );
        }
        if (statusFilter !== 'all') {
            list = list.filter((u: User) => u.activationStatus === statusFilter);
        }
        return [...list].sort((a, b) =>
            (a.mail ?? '').toLowerCase().localeCompare((b.mail ?? '').toLowerCase())
        );
    }, [usersQuery.data, search, statusFilter]);

    const getStatusLabel = (status: ActivationStatus | string) => {
        switch (status) {
            case ActivationStatus.ACTIVATED:
                return t('ADMIN_PAGES.USER.STATUS_ACTIVATED');
            case ActivationStatus.BANNED:
                return t('ADMIN_PAGES.USER.STATUS_BANNED');
            case ActivationStatus.NOT_VERIFIED:
                return t('ADMIN_PAGES.USER.STATUS_NOT_VERIFIED');
            default:
                return status ?? '-';
        }
    };

    if (usersQuery.isLoading) return <SVHPageWrapper p="md"><Text>Loading...</Text></SVHPageWrapper>;
    if (usersQuery.isError) return <SVHPageWrapper p="md"><Text c="red">Error loading users.</Text></SVHPageWrapper>;

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="xs">
                {t('ADMIN_PAGES.USERS.TITLE')}
            </Title>
            <Flex gap="sm" align="flex-end" mb="sm" wrap="wrap">
                <TextInput
                    size="sm"
                    placeholder={t('ADMIN_PAGES.USERS.SEARCH_PLACEHOLDER')}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    style={{ width: 260 }}
                />
                <Select
                    size="sm"
                    placeholder={t('ADMIN_PAGES.USERS.STATUS_ALL')}
                    data={[
                        { value: 'all', label: t('ADMIN_PAGES.USERS.STATUS_ALL') },
                        { value: ActivationStatus.ACTIVATED, label: t('ADMIN_PAGES.USER.STATUS_ACTIVATED') },
                        { value: ActivationStatus.BANNED, label: t('ADMIN_PAGES.USER.STATUS_BANNED') },
                        { value: ActivationStatus.NOT_VERIFIED, label: t('ADMIN_PAGES.USER.STATUS_NOT_VERIFIED') },
                    ]}
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v ?? 'all')}
                    style={{ width: 180 }}
                />
            </Flex>
            <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('ADMIN_PAGES.USERS.TABLE_EMAIL')}</Table.Th>
                        <Table.Th>{t('ADMIN_PAGES.USERS.TABLE_NAME')}</Table.Th>
                        <Table.Th>{t('ADMIN_PAGES.USERS.TABLE_STATUS')}</Table.Th>
                        <Table.Th>{t('ADMIN_PAGES.USERS.TABLE_ACTIONS')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {filteredUsers.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={4}>
                                <Text c="dimmed">{t('ADMIN_PAGES.USERS.EMPTY')}</Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        filteredUsers.map((user) => (
                            <Table.Tr key={user._id}>
                                <Table.Td>{user.mail}</Table.Td>
                                <Table.Td>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}</Table.Td>
                                <Table.Td>{getStatusLabel(user.activationStatus)}</Table.Td>
                                <Table.Td>
                                    <ActionIcon
                                        color="blue"
                                        variant="subtle"
                                        onClick={() => navigate(`/admin/users/${user._id}`)}
                                        title={t('ADMIN_PAGES.USERS.VIEW')}
                                    >
                                        <IconEdit />
                                    </ActionIcon>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
        </SVHPageWrapper>
    );
};

export default AdminUsers;
