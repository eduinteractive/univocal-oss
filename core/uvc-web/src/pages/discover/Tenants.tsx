import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Flex, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { EDICard, NotificationHandler } from '@eduinteractive/mantine-common';
import { eventEmitter, useAuth } from '../../context/AuthContext';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

const Tenants = () => {
    const { authData } = useAuth();
    const { t } = useTranslation();

    const myJoinRequestsQuery = useQuery({
        queryKey: ['userTenantJoinRequests'],
        queryFn: () => SAPI.TENANT.PRIVATE.getUserTenantRequests(),
        enabled: Boolean(authData),
    });

    const tenantsQuery = useQuery({
        queryKey: ['tenants'],
        queryFn: () =>
            SAPI.TENANT.PUBLIC.getTenants({
                params: {
                    visibility: 'PUBLIC',
                },
            }),
    });

    const joinTenantMutation = useMutation({
        mutationFn: SAPI.TENANT.PRIVATE.joinTenant,
        onSuccess: () => {
            eventEmitter.emit('refreshAuth');
            tenantsQuery.refetch();
            NotificationHandler.showSuccess(
                t('DISCOVER_PAGES.TENANTS.SUCCESS.JOINED')
            );
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const requestJoinMutation = useMutation({
        mutationFn: SAPI.TENANT.PRIVATE.createTenantJoinRequest,
        onSuccess: () => {
            myJoinRequestsQuery.refetch();
            NotificationHandler.showSuccess(
                t('DISCOVER_PAGES.TENANTS.SUCCESS.REQUEST_SENT')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const withdrawRequestMutation = useMutation({
        mutationFn: SAPI.TENANT.PRIVATE.cancelUserTenantRequest,
        onSuccess: () => {
            myJoinRequestsQuery.refetch();
            NotificationHandler.showSuccess(
                t('PAGES.USER.TENANT_JOIN_REQUESTS.SUCCESS_WITHDRAW')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const leaveTenantMutation = useMutation({
        mutationFn: SAPI.AUTH.TENANT.deleteUsersGroup,
        onSuccess: () => {
            eventEmitter.emit('refreshAuth');
            tenantsQuery.refetch();
            NotificationHandler.showSuccess(
                t('DISCOVER_PAGES.TENANTS.SUCCESS.LEFT')
            );
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue">
                {t('DISCOVER_PAGES.TENANTS.TITLE')}
            </Title>
            <Text size="sm" mb="sm">
                {t('DISCOVER_PAGES.TENANTS.DESCRIPTION')}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="md">
                {tenantsQuery.data &&
                    tenantsQuery.data.map((tenant) => {
                        const pendingRequestRow = myJoinRequestsQuery.data?.find(
                            (r) =>
                                typeof r.tenant === 'object' &&
                                r.tenant !== null &&
                                '_id' in r.tenant &&
                                (r.tenant as { _id: string })._id === tenant._id
                        );
                        return (
                        <EDICard
                            cardProps={{
                                withBorder: true,
                                shadow: 'sm',
                                pt: 'lg',
                                pb: 'lg',
                                w: '100%',
                            }}
                            spoiler={false}
                            innerBorder
                            footer={
                                <Group my={5} w="100%">
                                    {authData?.groups.find(
                                        (g) => g._id === tenant._id
                                    ) ? (
                                        <Button
                                            variant="subtle"
                                            size="compact-sm"
                                            w="100%"
                                            onClick={() => 
                                                leaveTenantMutation.mutate({
                                                    groupId: tenant._id,
                                                    userId: authData._id,
                                                })
                                            }
                                        >
                                            {t('DISCOVER_PAGES.TENANTS.BUTTONS.LEAVE')}
                                        </Button>
                                    ) : tenant.visibility === 'PUBLIC' ? (
                                        <Button
                                            variant="primary"
                                            size="compact-sm"
                                            w="100%"
                                            onClick={() =>
                                                joinTenantMutation.mutate({
                                                    tenantId: tenant._id,
                                                })
                                            }
                                        >
                                            {t('DISCOVER_PAGES.TENANTS.BUTTONS.JOIN')}
                                        </Button>
                                    ) : tenant.visibility === 'ON_REQUEST' ? (
                                        <Stack gap="xs" w="100%">
                                            {pendingRequestRow ? (
                                                <Button
                                                    variant="light"
                                                    color="red"
                                                    size="compact-sm"
                                                    w="100%"
                                                    loading={
                                                        withdrawRequestMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        withdrawRequestMutation.mutate(
                                                            {
                                                                requestId:
                                                                    pendingRequestRow._id,
                                                            }
                                                        )
                                                    }
                                                >
                                                    {t(
                                                        'DISCOVER_PAGES.TENANTS.BUTTONS.WITHDRAW'
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    size="compact-sm"
                                                    w="100%"
                                                    loading={
                                                        requestJoinMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        requestJoinMutation.mutate({
                                                            tenantId: tenant._id,
                                                        })
                                                    }
                                                >
                                                    {t(
                                                        'DISCOVER_PAGES.TENANTS.BUTTONS.REQUEST'
                                                    )}
                                                </Button>
                                            )}
                                        </Stack>
                                    ) : null}
                                </Group>
                            }
                        >
                            <Flex direction="column" gap={5}>
                                <Title order={5} c="edi-color">
                                    {tenant.title}
                                </Title>
                                <Text size="sm" c="dimmed">
                                    {tenant.description}
                                </Text>
                            </Flex>
                        </EDICard>
                        );
                    })}
            </SimpleGrid>
        </SVHPageWrapper>
    );
};

export default Tenants;
