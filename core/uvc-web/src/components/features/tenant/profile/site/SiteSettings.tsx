import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    CopyButton,
    Divider,
    Flex,
    Group,
    Loader,
    Stack,
    Switch,
    Text,
    TextInput,
    Textarea,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
    IconCheck,
    IconCopy,
    IconExternalLink,
    IconInfoCircle,
    IconBug,
    IconQrcode,
    IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileSite, SAPI } from '@eduinteractive/uvc-api';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import QRCode from 'react-qr-code';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../../../../../context/TenantContext';
import { checkPermission } from '../../../../../utils/Permission';
import {
    PROFILE_BASE_DOMAIN,
    buildSitePathUrl,
    buildSiteUrl,
} from '../../../../../utils/SiteHost';
import BugModal from '../../BugModal';
import SiteAppearanceSettings from './SiteAppearanceSettings';
import SiteLegalSettings from './SiteLegalSettings';
import SiteSocialSettings from './SiteSocialSettings';

interface SiteSettingsProps {
    site?: ProfileSite;
}

const sanitizeInput = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 63);

const SiteSettings = ({ site }: SiteSettingsProps) => {
    const { t } = useTranslation();
    const { hash } = useLocation();
    const { currentTenant } = useTenant();
    const queryClient = useQueryClient();
    const canEdit = checkPermission(currentTenant!, 'profile:update');
    const tenantId = currentTenant?._id;

    const [subdomain, setSubdomain] = useState(site?.subdomain ?? '');
    const [debouncedSubdomain] = useDebouncedValue(subdomain, 400);
    const [seoTitle, setSeoTitle] = useState(site?.seoTitle ?? '');
    const [seoDescription, setSeoDescription] = useState(site?.seoDescription ?? '');
    const [qrVisible, setQrVisible] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

    useEffect(() => {
        setSubdomain(site?.subdomain ?? '');
        setSeoTitle(site?.seoTitle ?? '');
        setSeoDescription(site?.seoDescription ?? '');
    }, [site?.subdomain, site?.seoTitle, site?.seoDescription]);

    useEffect(() => {
        if (hash !== '#site-legal') return;
        document.getElementById('site-legal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [hash]);

    const isUnchanged = debouncedSubdomain === (site?.subdomain ?? '');

    const savedSubdomain = site?.subdomain;
    const subdomainLocked = !!savedSubdomain;

    const checkQuery = useQuery({
        queryKey: ['site-subdomain-check', tenantId, debouncedSubdomain],
        queryFn: () =>
            SAPI.PROFILE.TENANT.checkSubdomain({ tenantId, subdomain: debouncedSubdomain }),
        enabled: canEdit && !subdomainLocked && !!debouncedSubdomain && !isUnchanged,
    });

    const onSiteUpdated = (data: ProfileSite) => {
        queryClient.setQueryData(['profile-site', tenantId], data);
        queryClient.invalidateQueries({ queryKey: ['profile-site-preview', tenantId] });
    };

    const subdomainMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateSubdomain,
        onSuccess: (data) => {
            onSiteUpdated(data);
            NotificationHandler.showSuccess(t('SITE.SETTINGS.SUBDOMAIN_SAVED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const siteMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateSite,
        onSuccess: (data) => {
            onSiteUpdated(data);
            NotificationHandler.showSuccess(t('SITE.SETTINGS.SAVED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const isSaving = (field: 'appearance' | 'socialLinks' | 'legal' | 'seoTitle') =>
        siteMutation.isPending && !!siteMutation.variables && field in siteMutation.variables.body;

    const siteUrl = savedSubdomain ? buildSiteUrl(savedSubdomain) : undefined;
    const fallbackUrl = savedSubdomain ? buildSitePathUrl(savedSubdomain) : undefined;

    const renderAvailability = () => {
        if (!subdomain || isUnchanged || subdomain !== debouncedSubdomain) return null;
        if (checkQuery.isFetching) return <Loader size="xs" />;
        if (!checkQuery.data) return null;
        if (checkQuery.data.available) {
            return (
                <Badge color="green" leftSection={<IconCheck size={12} />} variant="light">
                    {t('SITE.SETTINGS.AVAILABLE')}
                </Badge>
            );
        }
        return (
            <Badge color="red" leftSection={<IconX size={12} />} variant="light">
                {t(`SITE.SETTINGS.UNAVAILABLE.${checkQuery.data.reason ?? 'TAKEN'}`)}
            </Badge>
        );
    };

    const canSaveSubdomain =
        canEdit &&
        !subdomainLocked &&
        !!subdomain &&
        subdomain !== savedSubdomain &&
        subdomain === debouncedSubdomain &&
        checkQuery.data?.available === true;

    return (
        <Stack gap="xl">
            <BugModal
                visible={supportOpen}
                onClose={() => setSupportOpen(false)}
                tenantId={tenantId}
                initialType="OTHER"
                initialDescription={
                    savedSubdomain
                        ? t('SITE.SETTINGS.SUBDOMAIN_CHANGE_REQUEST', { subdomain: savedSubdomain })
                        : undefined
                }
            />

            <EDIModal
                visible={qrVisible}
                onClose={() => setQrVisible(false)}
                title={t('SITE.SETTINGS.QR_TITLE')}
                type="ALERT"
            >
                {siteUrl && (
                    <Stack align="center" gap="sm">
                        <Box bg="white" p="md">
                            <QRCode value={siteUrl} size={220} />
                        </Box>
                        <Text size="sm" c="dimmed">
                            {siteUrl}
                        </Text>
                    </Stack>
                )}
            </EDIModal>

            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('SITE.SETTINGS.SUBDOMAIN_TITLE')}
                </Title>
                {!subdomainLocked && (
                    <Text size="sm" c="dimmed" mb="md">
                        {t('SITE.SETTINGS.SUBDOMAIN_DESCRIPTION')}
                    </Text>
                )}
                <Group align="flex-end" gap="sm" wrap="nowrap">
                    <TextInput
                        flex={1}
                        label={t('SITE.SETTINGS.SUBDOMAIN_LABEL')}
                        placeholder="fachschaft"
                        value={subdomain}
                        disabled={!canEdit || subdomainLocked}
                        onChange={(event) => setSubdomain(sanitizeInput(event.currentTarget.value))}
                        rightSection={
                            <Text size="sm" c="dimmed" pr="xs">
                                .{PROFILE_BASE_DOMAIN}
                            </Text>
                        }
                        rightSectionWidth={PROFILE_BASE_DOMAIN.length * 8 + 24}
                    />
                    {!subdomainLocked && (
                        <Button
                            disabled={!canSaveSubdomain}
                            loading={subdomainMutation.isPending}
                            onClick={() => subdomainMutation.mutate({ tenantId, subdomain })}
                        >
                            {t('SITE.SAVE')}
                        </Button>
                    )}
                </Group>
                {!subdomainLocked && (
                    <Group mt="xs" gap="xs" mih={22}>
                        {renderAvailability()}
                    </Group>
                )}
                {subdomainLocked ? (
                    <Alert mt="md" color="violet" variant="light" icon={<IconInfoCircle />}>
                        <Group justify="space-between" align="center" gap="sm">
                            <Text size="sm">{t('SITE.SETTINGS.SUBDOMAIN_LOCKED')}</Text>
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconBug size={14} />}
                                onClick={() => setSupportOpen(true)}
                            >
                                {t('SITE.SETTINGS.SUBDOMAIN_CONTACT_SUPPORT')}
                            </Button>
                        </Group>
                    </Alert>
                ) : (
                    <Text size="xs" c="dimmed">
                        {t('SITE.SETTINGS.SUBDOMAIN_HINT')}
                    </Text>
                )}

                {savedSubdomain && (
                    <>
                        <Divider my="md" />
                        <Stack gap="xs">
                            <UrlRow label={t('SITE.SETTINGS.URL')} url={siteUrl!} />
                            <UrlRow label={t('SITE.SETTINGS.FALLBACK_URL')} url={fallbackUrl!} />
                        </Stack>
                        <Group mt="md" gap="xs">
                            <Button
                                variant="light"
                                leftSection={<IconQrcode size={16} />}
                                onClick={() => setQrVisible(true)}
                            >
                                {t('SITE.SETTINGS.QR_BUTTON')}
                            </Button>
                        </Group>
                    </>
                )}
            </Card>

            <Card withBorder radius="sm" p="xl">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box>
                        <Title order={3} c="violet" mb={4}>
                            {t('SITE.SETTINGS.PUBLISH_TITLE')}
                        </Title>
                        <Text size="sm" c="dimmed">
                            {t('SITE.SETTINGS.PUBLISH_DESCRIPTION')}
                        </Text>
                    </Box>
                    <Switch
                        size="lg"
                        onLabel={t('TENANT.MISC.ON')}
                        offLabel={t('TENANT.MISC.OFF')}
                        checked={!!site?.published}
                        disabled={!canEdit || !savedSubdomain || siteMutation.isPending}
                        onChange={(event) =>
                            siteMutation.mutate({
                                tenantId,
                                body: { published: event.currentTarget.checked },
                            })
                        }
                    />
                </Group>
                {!savedSubdomain && (
                    <Alert mt="md" color="violet" variant="light" icon={<IconInfoCircle />}>
                        {t('SITE.SETTINGS.PUBLISH_NEEDS_SUBDOMAIN')}
                    </Alert>
                )}
            </Card>

            <SiteAppearanceSettings
                site={site}
                tenantId={tenantId}
                canEdit={canEdit}
                saving={isSaving('appearance')}
                onSave={(appearance) => siteMutation.mutate({ tenantId, body: { appearance } })}
            />

            <SiteSocialSettings
                site={site}
                canEdit={canEdit}
                saving={isSaving('socialLinks')}
                onSave={(socialLinks) => siteMutation.mutate({ tenantId, body: { socialLinks } })}
            />

            <SiteLegalSettings
                site={site}
                canEdit={canEdit}
                saving={isSaving('legal')}
                onSave={(legal) => siteMutation.mutate({ tenantId, body: { legal } })}
            />

            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('SITE.SETTINGS.SEO_TITLE')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('SITE.SETTINGS.SEO_DESCRIPTION')}
                </Text>
                <Stack gap="sm">
                    <TextInput
                        label={t('SITE.SETTINGS.SEO_TITLE_LABEL')}
                        placeholder={currentTenant?.tenant?.title}
                        value={seoTitle}
                        maxLength={120}
                        disabled={!canEdit}
                        onChange={(event) => setSeoTitle(event.currentTarget.value)}
                    />
                    <Textarea
                        label={t('SITE.SETTINGS.SEO_DESCRIPTION_LABEL')}
                        value={seoDescription}
                        maxLength={300}
                        autosize
                        minRows={2}
                        disabled={!canEdit}
                        onChange={(event) => setSeoDescription(event.currentTarget.value)}
                    />
                    <Flex justify="flex-end">
                        <Button
                            disabled={!canEdit}
                            loading={isSaving('seoTitle')}
                            onClick={() =>
                                siteMutation.mutate({
                                    tenantId,
                                    body: { seoTitle, seoDescription },
                                })
                            }
                        >
                            {t('SITE.SAVE')}
                        </Button>
                    </Flex>
                </Stack>
            </Card>
        </Stack>
    );
};

const UrlRow = ({ label, url }: { label: string; url: string }) => {
    const { t } = useTranslation();
    return (
        <Group justify="space-between" wrap="nowrap" gap="xs">
            <Box style={{ minWidth: 0 }}>
                <Text size="xs" c="dimmed">
                    {label}
                </Text>
                <Text size="sm" fw={600} truncate>
                    {url}
                </Text>
            </Box>
            <Group gap="sm" wrap="nowrap">
                <CopyButton value={url}>
                    {({ copied, copy }) => (
                        <Tooltip label={copied ? t('SITE.SETTINGS.COPIED') : t('SITE.SETTINGS.COPY')}>
                            <ActionIcon variant="subtle" color={copied ? 'green' : 'violet'} onClick={copy}>
                                {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>
                <ActionIcon variant="subtle" component="a" href={url} target="_blank" rel="noopener noreferrer">
                    <IconExternalLink size={18} />
                </ActionIcon>
            </Group>
        </Group>
    );
};

export default SiteSettings;
