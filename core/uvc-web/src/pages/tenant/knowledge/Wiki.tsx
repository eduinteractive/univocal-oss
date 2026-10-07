import { Flex } from '@mantine/core';
import WikiNavigation from '../../../components/features/tenant/knowledge/wiki/WikiNavigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import {
    SAPI,
    WikiSection,
} from '@eduinteractive/uvc-api';
import { useTenant } from '../../../context/TenantContext';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import WikiContent from '../../../components/features/tenant/knowledge/wiki/WikiContent';
import WikiModal from '../../../components/features/tenant/knowledge/wiki/WikiModal';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { checkPermission } from '../../../utils/Permission';

const Wiki = () => {
    const { wikiId } = useParams();
    const matchMedia = useMediaQuery('(max-width: 48em)');
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const [wikiModalVisible, setWikiModalVisible] = useState(false);
    const [currentWikiSection, setCurrentWikiSection] = useState<string | null>(
        null
    );
    const [currentData, setCurrentData] = useState<WikiSection | undefined>(
        undefined
    );
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const wikiQuery = useQuery({
        queryKey: ['wiki', wikiId],
        queryFn: () =>
            SAPI.KNOWLEDGE.TENANT.getWiki({
                tenantId: currentTenant!._id,
                wikiId: wikiId!,
            }),
    });

    const canEdit = Boolean(
        currentTenant &&
            (checkPermission(currentTenant, 'knowledge:edit') ||
                wikiQuery.data?.authorId === authData?._id)
    );

    const wikiSectionQuery = useQuery({
        queryKey: ['wikiSection', currentWikiSection],
        queryFn: () =>
            SAPI.KNOWLEDGE.TENANT.getWikiSection({
                tenantId: currentTenant!._id,
                wikiId: wikiId!,
                sectionId: currentWikiSection!,
            }),
        enabled: !!currentWikiSection,
    });

    const etherpadQuery = useQuery({
        queryKey: ['wikiSectionEtherpad', wikiId, currentWikiSection],
        queryFn: () =>
            SAPI.KNOWLEDGE.TENANT.getWikiSectionEtherpad({
                tenantId: currentTenant!._id,
                wikiId: wikiId!,
                sectionId: currentWikiSection!,
            }),
        enabled: currentData?.type === 'etherpad' && !!currentWikiSection,
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const wikiUpdateMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.updateWiki,
        onSuccess: () => {
            wikiQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKI.SUCCESS.UPDATED')
            );
            setWikiModalVisible(false);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const wikiAddSectionMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.createWikiSection,
        onSuccess: () => {
            wikiQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKI.SECTION.SUCCESS.CREATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const wikiEditSectionMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.updateWikiSection,
        onSuccess: () => {
            wikiQuery.refetch();
            wikiSectionQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKI.SECTION.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const wikiDeleteSectionMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.deleteWikiSection,
        onSuccess: () => {
            wikiQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.WIKI.SECTION.SUCCESS.DELETED')
            );
            setCurrentWikiSection(null);
            setCurrentData(undefined);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const setSectionTypeMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.setWikiSectionType,
        onSuccess: (section) => {
            setCurrentData(section);
            wikiSectionQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const etherpadSyncMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.syncWikiSectionEtherpad,
    });

    useEffect(() => {
        setCurrentData(undefined);
    }, [currentWikiSection]);

    useEffect(() => {
        if (wikiSectionQuery.data?._id === currentWikiSection) {
            setCurrentData(wikiSectionQuery.data);
        }
    }, [wikiSectionQuery.data, currentWikiSection]);

    useEffect(() => {
        if (
            currentData?.type !== 'etherpad' ||
            currentData._id !== currentWikiSection ||
            !canEdit ||
            !currentWikiSection ||
            !currentTenant ||
            !wikiId
        ) {
            return;
        }
        const tenantId = currentTenant._id;
        const sectionId = currentWikiSection;
        const sync = () => {
            etherpadSyncMutation.mutate({
                tenantId,
                wikiId,
                sectionId,
            });
        };
        const timer = window.setInterval(sync, 5000);
        return () => {
            window.clearInterval(timer);
            sync();
        };
    }, [currentData?.type, currentWikiSection, canEdit, currentTenant, wikiId, etherpadSyncMutation.mutate]);

    useEffect(() => {
        if (searchParams.get('sectionId') !== "undefined" && searchParams.get('sectionId') !== null) {
            setCurrentWikiSection(searchParams.get('sectionId')!);
        }
    }, [searchParams]);

    return (
        <>
            <Flex direction={matchMedia ? 'column' : 'row'} h="100%" flex={1} gap="sm">
                <WikiModal
                    data={wikiQuery.data}
                    visible={wikiModalVisible}
                    onClose={() => setWikiModalVisible(false)}
                    onSubmit={(body) =>
                        wikiUpdateMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            body,
                        })
                    }
                />
                <WikiNavigation
                    data={wikiQuery.data}
                    onAdd={(body) =>
                        wikiAddSectionMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            body,
                        })
                    }
                    onEdit={(body) =>
                        wikiEditSectionMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            sectionId: body.sectionId!,
                            body: {
                                title: body.title,
                            },
                        })
                    }
                    onEditWiki={() => setWikiModalVisible(true)}
                    onEditWikiToC={(body) =>
                        wikiUpdateMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            body,
                        })
                    }
                    onDelete={(body) =>
                        wikiDeleteSectionMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            sectionId: body.sectionId!,
                        })
                    }
                    onOpen={(sectionId) => setCurrentWikiSection(sectionId)}
                />
                <WikiContent
                    data={currentData}
                    canEdit={canEdit}
                    permissionsReady={wikiQuery.isFetched}
                    choosingType={setSectionTypeMutation.isPending}
                    padUrl={etherpadQuery.data?.url}
                    padError={etherpadQuery.isError}
                    onChooseType={(type) =>
                        setSectionTypeMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            sectionId: currentWikiSection!,
                            body: { type },
                        })
                    }
                    onDelete={(sectionId) =>
                        wikiDeleteSectionMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            sectionId,
                        })
                    }
                    onUpdate={(body) =>
                        wikiEditSectionMutation.mutate({
                            tenantId: currentTenant!._id,
                            wikiId: wikiId!,
                            sectionId: currentWikiSection!,
                            body: {
                                title: body.title,
                                ...(body.content !== undefined ? { content: body.content } : {}),
                                materials: body.materials,
                                newUploads: body.newUploads,
                            },
                        })
                    }
                    onMaterialDownload={(link) =>
                        window.open(
                            `${
                                import.meta.env.VITE_KUBERNETES_HOST
                            }/api/knowledge/tenant/${currentTenant?._id}/wiki/${wikiId}/section/${currentWikiSection}/download/${encodeURIComponent(
                                link
                            )}`,
                            '_blank'
                        )
                    }
                />
            </Flex>
        </>
    );
};

export default Wiki;
