import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { Anchor, Button, Card, Select, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { SAPI } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { ActivationStatus } from '@eduinteractive/uvc-api';
import { useState } from 'react';

const ACTION_BAN = 'ban';
const ACTION_UNBAN = 'unban';

const AdminUser = () => {
    const { userId } = useParams<{ userId: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const userQuery = useQuery({
        queryKey: ['admin-user', userId],
        queryFn: () => SAPI.AUTH.ADMIN.getAdminUserById({ userId: userId! }),
        enabled: !!userId,
    });

    const banMutation = useMutation({
        mutationFn: SAPI.AUTH.ADMIN.banUser,
        onSuccess: () => {
            userQuery.refetch();
            setSelectedAction(null);
            NotificationHandler.showSuccess(t('ADMIN_PAGES.USER.SUCCESS_BANNED'));
        },
        onError: NotificationHandler.showError,
    });

    const unbanMutation = useMutation({
        mutationFn: SAPI.AUTH.ADMIN.unbanUser,
        onSuccess: () => {
            userQuery.refetch();
            setSelectedAction(null);
            NotificationHandler.showSuccess(t('ADMIN_PAGES.USER.SUCCESS_UNBANNED'));
        },
        onError: NotificationHandler.showError,
    });

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

    const handleExecuteAction = () => {
        if (!userId || !selectedAction) return;
        if (selectedAction === ACTION_BAN) {
            banMutation.mutate({ userId });
        } else if (selectedAction === ACTION_UNBAN) {
            unbanMutation.mutate({ userId });
        }
    };

    if (!userId) {
        return (
            <SVHPageWrapper p="md">
                <Text c="red">Missing user ID.</Text>
            </SVHPageWrapper>
        );
    }

    if (userQuery.isLoading) {
        return (
            <SVHPageWrapper p="md">
                <Text>Loading...</Text>
            </SVHPageWrapper>
        );
    }

    if (userQuery.isError || !userQuery.data) {
        return (
            <SVHPageWrapper p="md">
                <Text c="red">User not found.</Text>
                <Anchor component="button" type="button" onClick={() => navigate('/admin/users')} mt="sm">
                    {t('ADMIN_PAGES.USER.BACK')}
                </Anchor>
            </SVHPageWrapper>
        );
    }

    const user = userQuery.data;
    const isBusy = banMutation.isPending || unbanMutation.isPending;

    return (
        <SVHPageWrapper p="md">
            <Anchor component="button" type="button" onClick={() => navigate('/admin/users')} mb="md" size="sm">
                {t('ADMIN_PAGES.USER.BACK')}
            </Anchor>
            <Title order={3} c="blue" mb="md">
                {t('ADMIN_PAGES.USER.TITLE')}
            </Title>

            <Card withBorder mb="md" padding="md">
                <Stack gap="xs">
                    <Text><strong>{t('ADMIN_PAGES.USER.EMAIL')}:</strong> {user.mail}</Text>
                    <Text><strong>{t('ADMIN_PAGES.USER.NAME')}:</strong> {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}</Text>
                    <Text><strong>{t('ADMIN_PAGES.USER.STATUS')}:</strong> {getStatusLabel(user.activationStatus)}</Text>
                    <Text><strong>{t('ADMIN_PAGES.USER.GROUPS')}:</strong> {user.groups?.length ? user.groups.length : 0}</Text>
                </Stack>
            </Card>

            <Card withBorder padding="md">
                <Text fw={600} mb="sm">{t('ADMIN_PAGES.USER.ACTIONS')}</Text>
                <Stack gap="sm">
                    <Select
                        label={t('ADMIN_PAGES.USER.ACTION_LABEL')}
                        placeholder={t('ADMIN_PAGES.USER.ACTION_LABEL')}
                        data={[
                            { value: ACTION_BAN, label: t('ADMIN_PAGES.USER.ACTION_BAN') },
                            { value: ACTION_UNBAN, label: t('ADMIN_PAGES.USER.ACTION_UNBAN') },
                        ]}
                        value={selectedAction}
                        onChange={setSelectedAction}
                    />
                    <Button
                        onClick={handleExecuteAction}
                        disabled={!selectedAction || isBusy}
                        loading={isBusy}
                    >
                        {t('ADMIN_PAGES.USER.EXECUTE')}
                    </Button>
                </Stack>
            </Card>
        </SVHPageWrapper>
    );
};

export default AdminUser;
