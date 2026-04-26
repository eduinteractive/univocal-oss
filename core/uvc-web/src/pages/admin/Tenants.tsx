import TenantsTable from '../../components/features/admin/TenantsTable';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TenantsFilter from '../../components/features/admin/TenantsFilter';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { Title } from '@mantine/core';
import { SAPI, Tenant } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

const Tenants = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);

    const tenantsQuery = useQuery({
        queryKey: ['tenants'],
        queryFn: () => SAPI.TENANT.PUBLIC.getTenants({}),
    });

    const updateTenantMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.updateTenant,
        onSuccess: () => {
            tenantsQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.TENANTS.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createTenantMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.createTenant,
        onSuccess: () => {
            tenantsQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.TENANTS.SUCCESS.CREATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteTenantMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.deleteTenant,
        onSuccess: () => {
            tenantsQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.TENANTS.SUCCESS.DELETED'));
        },
    });

    const importTenantsMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.importTenants,
        onSuccess: () => {
            tenantsQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.TENANTS.SUCCESS.IMPORTED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    useEffect(() => {
        if (tenantsQuery.data) {
            const filteredTenantsByText = tenantsQuery.data.filter(
                (tenant) => {
                    return tenant.title
                        .toLowerCase()
                        .includes(
                            searchParams.get('text')?.toLowerCase() || ''
                        );
                }
            );

            setFilteredTenants(filteredTenantsByText);
        }
    }, [tenantsQuery.data, searchParams]);

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="sm">
                {t('ADMIN_PAGES.TENANTS.TITLE')}
            </Title>
            <TenantsFilter
                values={{
                    text: searchParams.get('text') || null,
                }}
                onAdd={(tenant) =>
                    createTenantMutation.mutate({
                        body: {
                            ...tenant,
                            domain: tenant.domain as string,
                        },
                    })
                }
                onFilter={(filter) => {
                    searchParams.set('text', filter.text || '');
                    setSearchParams(searchParams);
                    window.history.pushState(
                        {},
                        '',
                        `?${searchParams.toString()}`
                    );
                }}
                onImport={(data) => {
                    importTenantsMutation.mutate({ body: data });
                }}
            />
            <TenantsTable
                tenants={filteredTenants}
                onUpdate={(tenantId, tenant) =>
                    updateTenantMutation.mutate({
                        id: tenantId,
                        body: {
                            ...tenant,
                            domain: tenant.domain as string,
                        },
                    })
                }
                onDelete={(id) => deleteTenantMutation.mutate({ id })}
            />
        </SVHPageWrapper>
    );
};

export default Tenants;
