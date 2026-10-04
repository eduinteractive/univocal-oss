import {
    Anchor,
    Badge,
    Box,
    Button,
    Group,
    Modal,
    ScrollArea,
    SegmentedControl,
    Stack,
    Tabs,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import {
    IconCalendarEvent,
    IconChartBar,
    IconChecklist,
    IconDeviceDesktop,
    IconDeviceMobile,
    IconExternalLink,
    IconEye,
    IconFileText,
    IconHeartHandshake,
    IconHome,
    IconNews,
    IconRocket,
    IconSettings,
    IconWorldOff,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import ProfileBackgroundModal from '../../../components/features/tenant/profile/ProfileBackgroundModal';
import ProfileDescriptionModal from '../../../components/features/tenant/profile/ProfileDescriptionModal';
import ProfileMetaModal from '../../../components/features/tenant/profile/ProfileMetaModal';
import GalleryModal from '../../../components/features/tenant/profile/site/GalleryModal';
import LogoModal from '../../../components/features/tenant/profile/site/LogoModal';
import SitePreviewCanvas, { PreviewDevice } from '../../../components/features/tenant/profile/site/SitePreviewCanvas';
import SiteSettings from '../../../components/features/tenant/profile/site/SiteSettings';
import { buildSetupSteps, SetupAction, setupProgress } from '../../../components/features/tenant/profile/site/setupChecklist';
import BoardTab from '../../../components/features/tenant/profile/site/tabs/BoardTab';
import EventsTab from '../../../components/features/tenant/profile/site/tabs/EventsTab';
import InfosTab from '../../../components/features/tenant/profile/site/tabs/InfosTab';
import SetupTab from '../../../components/features/tenant/profile/site/tabs/SetupTab';
import StartTab, { StartModal } from '../../../components/features/tenant/profile/site/tabs/StartTab';
import SupportTab from '../../../components/features/tenant/profile/site/tabs/SupportTab';
import SurveysTab from '../../../components/features/tenant/profile/site/tabs/SurveysTab';
import useSiteBuilder, { useSupportRequests } from '../../../components/features/tenant/profile/site/useSiteBuilder';
import { buildSiteUrl, PROFILE_BASE_DOMAIN } from '../../../utils/SiteHost';

const TABS = ['start', 'board', 'events', 'surveys', 'support', 'infos', 'setup', 'settings'] as const;
type BuilderTab = (typeof TABS)[number];

const TAB_ALIASES: Record<string, BuilderTab> = { news: 'board', projects: 'board', wiki: 'infos' };

const resolveTab = (tab?: string): BuilderTab => {
    if (!tab) return 'start';
    if (TAB_ALIASES[tab]) return TAB_ALIASES[tab];
    return (TABS as readonly string[]).includes(tab) ? (tab as BuilderTab) : 'start';
};

const Builder = () => {
    const { t } = useTranslation();
    const params = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const builder = useSiteBuilder();
    const { tenantId, site, preview, canEdit } = builder;
    const activeTab = resolveTab(params.tab);

    const [modal, setModal] = useState<StartModal | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

    const profileQuery = useQuery({
        queryKey: ['profile', tenantId],
        queryFn: () => SAPI.PROFILE.TENANT.getProfile(tenantId),
        enabled: !!tenantId,
    });
    const profile = profileQuery.data?.profile;
    const supportRequestsQuery = useSupportRequests(tenantId);
    const openResponses = (supportRequestsQuery.data ?? []).reduce(
        (sum, request) => sum + (request.openResponseCount ?? 0),
        0
    );

    const onProfileUpdated = () => {
        profileQuery.refetch();
        builder.refreshPreview();
        queryClient.invalidateQueries({ queryKey: ['profile', tenantId] });
        NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.SUCCESS.UPDATED'));
        setModal(null);
    };

    const profileMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateProfile,
        onSuccess: onProfileUpdated,
        onError: NotificationHandler.showAxiosError,
    });

    const backgroundMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateProfileBackground,
        onSuccess: onProfileUpdated,
        onError: NotificationHandler.showAxiosError,
    });

    const steps = useMemo(() => buildSetupSteps(site, profile, preview), [site, profile, preview]);
    const progress = setupProgress(steps);

    const goTo = (tab: string) => {
        const [name, hash] = tab.split('#');
        navigate({
            pathname: name === 'start' ? '/sv/profile' : `/sv/profile/${name}`,
            hash: hash ? `#${hash}` : '',
        });
    };

    const handleSetupAction = (action: SetupAction, tab?: string) => {
        if (action === 'tab') {
            if (tab) goTo(tab);
            return;
        }
        goTo('start');
        setModal(action);
    };

    const togglePublish = () => {
        if (!site?.subdomain) {
            NotificationHandler.showInfo(t('SITE.SETTINGS.PUBLISH_NEEDS_SUBDOMAIN'));
            goTo('settings');
            return;
        }
        builder.updateSiteMutation.mutate(
            { tenantId, body: { published: !site.published } },
            {
                onSuccess: (data) =>
                    NotificationHandler.showSuccess(
                        data.published ? t('SITE.BUILDER.PUBLISHED_SUCCESS') : t('SITE.BUILDER.UNPUBLISHED_SUCCESS')
                    ),
            }
        );
    };

    const siteUrl = site?.subdomain ? buildSiteUrl(site.subdomain) : undefined;

    const tabs: { value: BuilderTab; label: string; icon: ReactNode; badge?: ReactNode }[] = [
        { value: 'start', label: t('SITE.TABS.START'), icon: <IconHome size={16} /> },
        { value: 'board', label: t('SITE.TABS.BOARD'), icon: <IconNews size={16} /> },
        { value: 'events', label: t('SITE.TABS.EVENTS'), icon: <IconCalendarEvent size={16} /> },
        { value: 'surveys', label: t('SITE.TABS.SURVEYS'), icon: <IconChartBar size={16} /> },
        {
            value: 'support',
            label: t('SITE.TABS.SUPPORT'),
            icon: <IconHeartHandshake size={16} />,
            badge: openResponses > 0 && (
                <Badge size="xs" color="red" circle={openResponses < 10}>
                    {openResponses}
                </Badge>
            ),
        },
        { value: 'infos', label: t('SITE.TABS.INFOS'), icon: <IconFileText size={16} /> },
        { value: 'settings', label: t('SITE.TABS.SETTINGS'), icon: <IconSettings size={16} /> },
        {
            value: 'setup',
            label: t('SITE.TABS.SETUP'),
            icon: <IconChecklist size={16} />,
            badge: progress.done < progress.total && (
                <Badge size="xs" variant="light" color="violet">
                    {progress.done}/{progress.total}
                </Badge>
            ),
        },
    ];

    const renderTab = () => {
        switch (activeTab) {
            case 'board':
                return <BoardTab builder={builder} />;
            case 'events':
                return <EventsTab builder={builder} />;
            case 'surveys':
                return <SurveysTab builder={builder} />;
            case 'support':
                return <SupportTab builder={builder} />;
            case 'infos':
                return <InfosTab builder={builder} />;
            case 'setup':
                return <SetupTab steps={steps} onAction={handleSetupAction} />;
            case 'settings':
                return <SiteSettings site={site} />;
            default:
                return (
                    <StartTab
                        builder={builder}
                        steps={steps}
                        onOpenModal={setModal}
                        onNavigate={goTo}
                        onSetupAction={handleSetupAction}
                    />
                );
        }
    };

    return (
        <SVHPageWrapper p={{ base: 'md', sm: 'xl' }}>
            <Stack gap="xl">
                <LogoModal builder={builder} opened={modal === 'logo'} onClose={() => setModal(null)} />
                <GalleryModal builder={builder} opened={modal === 'gallery'} onClose={() => setModal(null)} />
                <ProfileDescriptionModal
                    value={profile?.description || ''}
                    modalVisible={modal === 'description'}
                    onClose={() => setModal(null)}
                    onSave={(description) =>
                        profileMutation.mutate({ tenantId, body: { description, avatarImage: profile?.avatarImage } })
                    }
                />
                <ProfileMetaModal
                    key={`${profileQuery.dataUpdatedAt}-meta`}
                    values={profile}
                    modalVisible={modal === 'contacts'}
                    onClose={() => setModal(null)}
                    onSubmit={(data) => profileMutation.mutate({ tenantId, body: data })}
                />
                <ProfileBackgroundModal
                    key={`${profileQuery.dataUpdatedAt}-background`}
                    values={{ backgroundImage: profile?.backgroundImage }}
                    modalVisible={modal === 'background'}
                    onClose={() => setModal(null)}
                    onSubmit={(data) =>
                        backgroundMutation.mutate({ tenantId, body: { backgroundImage: data.backgroundImage || '' } })
                    }
                />

                <Modal
                    opened={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    fullScreen
                    styles={{
                        header: { borderBottom: '1px solid lightgrey' },
                        body: { paddingTop: 'var(--mantine-spacing-md)' },
                    }}
                    title={
                        <Group gap="md">
                            <Text>{t('SITE.BUILDER.PREVIEW')}</Text>
                            <SegmentedControl
                                size="xs"
                                value={previewDevice}
                                onChange={(value) => setPreviewDevice(value as PreviewDevice)}
                                data={[
                                    { value: 'desktop', label: <IconDeviceDesktop size={14} /> },
                                    { value: 'mobile', label: <IconDeviceMobile size={14} /> },
                                ]}
                            />
                        </Group>
                    }
                >
                    {preview && (
                        <SitePreviewCanvas data={preview} device={previewDevice} maxHeight="calc(100vh - 120px)" />
                    )}
                </Modal>

                <Group
                    justify="space-between"
                    gap="md"
                    align="flex-start"
                    w={{
                        base: 'calc(100% + (var(--mantine-spacing-md) * 2))',
                        sm: 'calc(100% + (var(--mantine-spacing-xl) * 2))',
                    }}
                    mx={{ base: 'calc(var(--mantine-spacing-md) * -1)', sm: 'calc(var(--mantine-spacing-xl) * -1)' }}
                    px={{ base: 'md', sm: 'xl' }}
                    pb="md"
                    style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
                >
                    <Box>
                        <Group gap="sm" mb={4}>
                            <Title order={3} c="violet">
                                {t('SITE.BUILDER.TITLE')}
                            </Title>
                            {site?.published ? (
                                <Badge color="green" variant="light" radius="sm">
                                    {t('SITE.BUILDER.STATUS_LIVE')}
                                </Badge>
                            ) : (
                                <Badge color="gray" variant="light" radius="sm">
                                    {t('SITE.BUILDER.STATUS_DRAFT')}
                                </Badge>
                            )}
                        </Group>
                        {siteUrl ? (
                            <Anchor href={siteUrl} target="_blank" rel="noopener noreferrer" size="sm" c="violet">
                                <Group gap={4}>
                                    {site?.subdomain}.{PROFILE_BASE_DOMAIN}
                                    <IconExternalLink size={14} />
                                </Group>
                            </Anchor>
                        ) : (
                            <Anchor size="sm" c="dimmed" onClick={() => goTo('settings')}>
                                {t('SITE.BUILDER.NO_SUBDOMAIN')}
                            </Anchor>
                        )}
                    </Box>
                    <Group gap="sm">
                        <Button
                            variant="default"
                            radius="md"
                            leftSection={<IconEye size={16} />}
                            onClick={() => setPreviewOpen(true)}
                            disabled={!preview}
                        >
                            {t('SITE.BUILDER.PREVIEW')}
                        </Button>
                        {canEdit && (
                            <Tooltip
                                label={t('SITE.SETTINGS.PUBLISH_NEEDS_SUBDOMAIN')}
                                disabled={!!site?.subdomain}
                                withArrow
                            >
                                <Button
                                    color={site?.published ? 'gray' : 'violet'}
                                    variant={site?.published ? 'light' : 'filled'}
                                    radius="md"
                                    leftSection={site?.published ? <IconWorldOff size={16} /> : <IconRocket size={16} />}
                                    loading={builder.updateSiteMutation.isPending}
                                    onClick={togglePublish}
                                >
                                    {site?.published ? t('SITE.BUILDER.UNPUBLISH') : t('SITE.BUILDER.PUBLISH')}
                                </Button>
                            </Tooltip>
                        )}
                    </Group>
                </Group>

                <Tabs value={activeTab} onChange={(value) => value && goTo(value)} color="violet">
                    <ScrollArea type="never" offsetScrollbars={false}>
                        <Tabs.List style={{ flexWrap: 'nowrap' }}>
                            {tabs.map((tab) => (
                                <Tabs.Tab
                                    key={tab.value}
                                    value={tab.value}
                                    leftSection={tab.icon}
                                    rightSection={tab.badge || undefined}
                                >
                                    {tab.label}
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>
                    </ScrollArea>
                </Tabs>

                <Box pb="xl">{renderTab()}</Box>
            </Stack>
        </SVHPageWrapper>
    );
};

export default Builder;
