import { useMutation, useQuery } from '@tanstack/react-query';
import { useTenant } from '../../../context/TenantContext';
import {
    News as INews,
    SAPI,
} from '@eduinteractive/uvc-api';
import { useState } from 'react';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import ProfileObjectModal from '../../../components/features/tenant/profile/ProfileObjectModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { PROFILE_OBJECT_STATUS, PROFILE_OBJECT_STATUS_STRINGS } from '../../../constants/Enums';
import ProfileObjectEditModal from '../../../components/features/tenant/profile/ProfileObjectEditModal';
import SVHFilter, { SVHFilterObject } from '../../../components/common/SVHFilter';
import { useTranslation } from 'react-i18next';

const News = () => {
    const { currentTenant } = useTenant();
    const [currentSelectedNews, setCurrentSelectedNews] =
        useState<INews | null>(null);
    const [currentViewObject, setCurrentViewObject] = useState<INews | null>(
        null
    );
    const [metadataFilter, setMetadataFilter] = useState<SVHFilterObject | null>(
        null
    );
    const { t } = useTranslation();

    const newsQuery = useQuery({
        queryKey: ['news', currentTenant?._id, metadataFilter],
        queryFn: () => SAPI.PROFILE.TENANT.getAllNews({
            tenantId: currentTenant!._id,
            params: metadataFilter
        }),
    });

    const createNewsMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.createNews,
        onSuccess: () => {
            newsQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.NEWS.SUCCESS.CREATED'));
            setCurrentSelectedNews(null);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateNewsMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateNews,
        onSuccess: () => {
            newsQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.NEWS.SUCCESS.UPDATED'));
            setCurrentSelectedNews(null);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteNewsMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.deleteNews,
        onSuccess: () => {
            newsQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.NEWS.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <>
            <ProfileObjectModal
                title={t('TENANT_PAGES.PROFILE.NEWS.MODAL_TITLE')}
                data={currentViewObject}
                visible={!!currentViewObject}
                onClose={() => setCurrentViewObject(null)}
            />
            <ProfileObjectEditModal
                prefix={t('TENANT_PAGES.PROFILE.NEWS.MODAL_TITLE')}
                modalVisible={currentSelectedNews !== null}
                values={currentSelectedNews || undefined}
                onClose={() => setCurrentSelectedNews(null)}
                onSubmit={(data) => {
                    if (currentSelectedNews?._id) {
                        updateNewsMutation.mutate({
                            tenantId: currentTenant?._id,
                            newsId: currentSelectedNews._id,
                            body: data,
                        });
                    } else {
                        createNewsMutation.mutate({
                            tenantId: currentTenant?._id,
                            body: data,
                        });
                    }
                }}
            />
            <SVHFilter
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () => setCurrentSelectedNews({
                        tenantId: currentTenant?._id || '',
                        authorId: '',
                        title: '',
                        content: '',
                        status: PROFILE_OBJECT_STATUS.DRAFT,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }),
                    text: t('TENANT_PAGES.PROFILE.NEWS.ADD'),
                    permission: 'profile_objects',
                }}
            />
            <SVHMetaGrid
                permissionPrefix="profile_objects"
                data={newsQuery.data || []}
                prefixKey="status"
                prefixFunc={(val) => PROFILE_OBJECT_STATUS_STRINGS[val as PROFILE_OBJECT_STATUS]}
                imageEnabled={true}
                onEdit={(news) => setCurrentSelectedNews(news as INews)}
                onDelete={(newsId) =>
                    deleteNewsMutation.mutate({
                        newsId,
                        tenantId: currentTenant!._id,
                    })
                }
                onOpen={(news) => setCurrentViewObject(news as INews)}
            />
        </>
    );
};

export default News;
