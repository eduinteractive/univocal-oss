import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import DomainTabs from '../../components/features/domain/DomainTabs';
import DomainNetworks from '../../components/features/domain/DomainNetworks';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

const Domain = () => {
    const { domainId } = useParams();
    const { t } = useTranslation();

    const domainTenants = useQuery({
        queryKey: ['domainTenants', domainId],
        queryFn: () =>
            SAPI.TENANT.PUBLIC.getTenants({
                params: {
                    domain: domainId,
                },
            }),
    });

    const tenantMemberInviteMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.createDomainInvitation,
        onSuccess: () => {
            NotificationHandler.showSuccess('Einladung erfolgreich versendet!');
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createDomainTenantMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.createDomainTenant,
        onSuccess: () => {
            domainTenants.refetch();
            NotificationHandler.showSuccess(t('DOMAIN_PAGES.DOMAIN.SUCCESS.GROUP_ADDED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateDomainTenantMutation = useMutation({
        mutationFn: SAPI.TENANT.ADMIN.updateDomainTenant,
        onSuccess: () => {
            domainTenants.refetch();
            NotificationHandler.showSuccess(t('DOMAIN_PAGES.DOMAIN.SUCCESS.GROUP_UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p={0}>
            <DomainTabs
                networksTab={
                    <DomainNetworks
                        data={domainTenants.data || []}
                        onCreate={(body) => {
                            createDomainTenantMutation.mutate({
                                body: {
                                    ...body,
                                    domain: domainId!,
                                },
                            });
                        }}
                        onUpdate={(tenantId, body) => {
                            updateDomainTenantMutation.mutate({
                                id: tenantId,
                                body: body,
                            });
                        }}
                        onMemberAdd={(tenantId, body) => {
                            tenantMemberInviteMutation.mutate({
                                domainId: domainId!,
                                body: {
                                    tenantId: tenantId,
                                    mail: body.email,
                                    permissionLevel: body.permission,
                                },
                            });
                        }}
                    />
                }
            />
        </SVHPageWrapper>
    );
};

export default Domain;
