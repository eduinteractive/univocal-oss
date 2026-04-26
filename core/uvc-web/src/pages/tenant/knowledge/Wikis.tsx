import {
    SAPI,
    Wiki,
} from '@eduinteractive/uvc-api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import WikiModal from '../../../components/features/tenant/knowledge/wiki/WikiModal';
import { useTenant } from '../../../context/TenantContext';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import { useNavigate } from 'react-router-dom';
import SVHFilter, { SVHFilterObject } from '../../../components/common/SVHFilter';
import { useTranslation } from 'react-i18next';

const Wikis = () => {
    const { currentTenant } = useTenant();
    const navigate = useNavigate();
    const [wikiModalVisible, setWikiModalVisible] = useState(false);
    const [currentWiki, setCurrentWiki] = useState<Wiki | null>(null);
    const [metadataFilter, setMetadataFilter] = useState<SVHFilterObject | null>(
        null
    );
    const { t } = useTranslation();

    const wikisQuery = useQuery({
        queryKey: ['wikis', currentTenant?._id, metadataFilter],
        queryFn: () => SAPI.KNOWLEDGE.TENANT.getWikis({
            tenantId: currentTenant!._id,
            params: metadataFilter
        }),
    });

    const createWikiMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.createWiki,
        onSuccess: () => {
            wikisQuery.refetch();
            setCurrentWiki(null);
            setWikiModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKIS.SUCCESS.CREATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateWikiMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.updateWiki,
        onSuccess: () => {
            wikisQuery.refetch();
            setCurrentWiki(null);
            setWikiModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKIS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteWikiMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.deleteWiki,
        onSuccess: () => {
            wikisQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKIS.SUCCESS.DELETED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <>
            <SVHFilter
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () => setWikiModalVisible(true),
                    text: t('TENANT_PAGES.KNOWLEDGE.WIKIS.ADD'),
                    permission: 'knowledge',
                }}
            />
            <WikiModal
                visible={wikiModalVisible}
                data={currentWiki || undefined}
                onClose={() => {
                    setWikiModalVisible(false);
                    setCurrentWiki(null);
                }}
                onSubmit={(body) => {
                    if (currentWiki) {
                        updateWikiMutation.mutate({
                            body,
                            wikiId: currentWiki._id,
                            tenantId: currentTenant!._id,
                        });
                    } else {
                        createWikiMutation.mutate({
                            tenantId: currentTenant!._id,
                            body,
                        });
                    }
                }}
            />
            <SVHMetaGrid
                permissionPrefix="knowledge"
                data={wikisQuery.data || []}
                onEdit={(wiki) => {
                    setCurrentWiki(wiki as Wiki);
                    setWikiModalVisible(true);
                }}
                onDelete={(wikiId) => {
                    deleteWikiMutation.mutate({
                        wikiId: wikiId,
                        tenantId: currentTenant!._id,
                    });
                }}
                onOpen={(item) => navigate(`wiki/${(item as Wiki)._id}`)}
            />
        </>
    );
};

export default Wikis;
