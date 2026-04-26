import { useMutation, useQuery } from '@tanstack/react-query';
import DomainTable from '../../components/features/admin/DomainTable';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { Title } from '@mantine/core';
import SVHLoader from '../../components/common/SVHLoader';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

const Domains = () => {
    const { t } = useTranslation();
    const domainQuery = useQuery({
        queryKey: ['domains'],
        queryFn: () => SAPI.TENANT.PUBLIC.getDomains(),
    });

    const domainCreateMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.createDomain,
        onSuccess: () => {
            domainQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.DOMAINS.SUCCESS.CREATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const domainUpdateMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.updateDomain,
        onSuccess: () => {
            domainQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.DOMAINS.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const domainDeleteMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.deleteDomain,
        onSuccess: () => {
            domainQuery.refetch();
            NotificationHandler.showSuccess(t('ADMIN_PAGES.DOMAINS.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    if (domainQuery.isLoading) {
        return <SVHLoader />;
    }

    if (domainQuery.isError) {
        return <div>Error: {domainQuery.error.message}</div>;
    }

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="sm">
                {t('ADMIN_PAGES.DOMAINS.TITLE')}
            </Title>
            <DomainTable
                domains={domainQuery.data || []}
                onDelete={(id) => domainDeleteMutation.mutate({ domainId: id })}
                onAdd={(domain) =>
                    domainCreateMutation.mutate({ body: domain })
                }
                onUpdate={(domain) =>
                    domainUpdateMutation.mutate({
                        domainId: domain._id,
                        body: domain,
                    })
                }
            />
        </SVHPageWrapper>
    );
};

export default Domains;
