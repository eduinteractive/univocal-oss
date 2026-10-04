import { Button, Divider, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { News, PROFILE_OBJECT_STATUS, PROFILE_SECTION_TYPE, SAPI, TenantProject } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NewsPage from '../../../../../../pages/tenant/profile/News';
import ProjectsPage from '../../../../../../pages/tenant/profile/Projects';
import FeaturePicker, { FeatureItem } from '../FeaturePicker';
import { SiteBuilder } from '../useSiteBuilder';

const BoardTab = ({ builder }: { builder: SiteBuilder }) => {
    const { t } = useTranslation();
    const tenantId = builder.tenantId;
    const [manage, setManage] = useState<'none' | 'news' | 'projects'>('none');

    const newsQuery = useQuery({
        queryKey: ['news', tenantId, 'board-picker'],
        queryFn: () => SAPI.PROFILE.TENANT.getAllNews({ tenantId: tenantId!, params: null }),
        enabled: !!tenantId,
    });
    const projectsQuery = useQuery({
        queryKey: ['projects', tenantId, 'board-picker'],
        queryFn: () => SAPI.PROFILE.TENANT.getTenantProjects({ tenantId: tenantId!, params: null }),
        enabled: !!tenantId,
    });

    const items: FeatureItem[] = useMemo(() => {
        const news = (newsQuery.data ?? []) as News[];
        const projects = (projectsQuery.data ?? []) as TenantProject[];
        return [
            ...news.map((item) => ({
                id: item._id!,
                title: item.title,
                meta: item.publishDate ? dayjs(item.publishDate).format('DD.MM.YYYY') : undefined,
                badge: {
                    label: t('SITE.PUBLIC.BOARD_NEWS'),
                    color: item.status === PROFILE_OBJECT_STATUS.PUBLISHED ? 'violet' : 'gray',
                },
                unavailableReason:
                    item.status !== PROFILE_OBJECT_STATUS.PUBLISHED
                        ? t('SITE.BUILDER.BOARD_NOT_PUBLISHED')
                        : undefined,
            })),
            ...projects.map((item) => ({
                id: item._id!,
                title: item.title,
                meta: item.publishDate ? dayjs(item.publishDate).format('DD.MM.YYYY') : undefined,
                badge: {
                    label: t('SITE.PUBLIC.BOARD_PROJECT'),
                    color: item.status === PROFILE_OBJECT_STATUS.PUBLISHED ? 'teal' : 'gray',
                },
                unavailableReason:
                    item.status !== PROFILE_OBJECT_STATUS.PUBLISHED
                        ? t('SITE.BUILDER.BOARD_NOT_PUBLISHED')
                        : undefined,
            })),
        ].sort((a, b) => (b.meta ?? '').localeCompare(a.meta ?? ''));
    }, [newsQuery.data, projectsQuery.data, t]);

    return (
        <Stack gap="xl">
            <FeaturePicker
                builder={builder}
                type={PROFILE_SECTION_TYPE.BOARD}
                items={items}
                description={t('SITE.BUILDER.BOARD_DESCRIPTION')}
                emptyText={t('SITE.BUILDER.BOARD_EMPTY')}
                toolbar={
                    <>
                        <Button onClick={() => setManage((current) => (current === 'news' ? 'none' : 'news'))}>
                            <Text size="sm">{t('SITE.BUILDER.MANAGE_NEWS')}</Text>
                        </Button>
                        <Button onClick={() => setManage((current) => (current === 'projects' ? 'none' : 'projects'))}>
                            <Text size="sm">{t('SITE.BUILDER.MANAGE_PROJECTS')}</Text>
                        </Button>
                    </>
                }
            />

            {manage !== 'none' && (
                <>
                    <Divider
                        label={
                            manage === 'news'
                                ? t('PROFILE.TABS.NEWS')
                                : t('PROFILE.TABS.PROJECTS')
                        }
                        labelPosition="left"
                    />
                    <Text size="sm" c="dimmed">
                        {t('SITE.BOARD.HINT')}
                    </Text>
                    {manage === 'news' ? <NewsPage /> : <ProjectsPage />}
                </>
            )}
        </Stack>
    );
};

export default BoardTab;
