import { ActionIcon, Badge, Box, Button, Card, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconEdit, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PROFILE_OBJECT_STATUS, ProfilePage, SAPI } from '@eduinteractive/uvc-api';
import { EDIDeleteDialog, NotificationHandler } from '@eduinteractive/mantine-common';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../../../context/TenantContext';
import { checkPermission } from '../../../../../../utils/Permission';
import { buildSiteUrl } from '../../../../../../utils/SiteHost';
import InfoPageModal, { InfoPageModalSubmit } from '../InfoPageModal';
import { pagesQueryKey, SiteBuilder } from '../useSiteBuilder';

const InfosTab = ({ builder }: { builder: SiteBuilder }) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const queryClient = useQueryClient();
    const tenantId = builder.tenantId;
    const [editing, setEditing] = useState<ProfilePage | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<ProfilePage | undefined>();

    const canCreate = checkPermission(currentTenant!, 'profile_objects:create');
    const canEdit = checkPermission(currentTenant!, 'profile_objects:edit');
    const canDelete = checkPermission(currentTenant!, 'profile_objects:delete');
    const canPublish = checkPermission(currentTenant!, 'profile_objects:publish');

    const pagesQuery = useQuery({
        queryKey: pagesQueryKey(tenantId),
        queryFn: () => SAPI.PROFILE.TENANT.getPages(tenantId),
        enabled: !!tenantId,
    });

    const onChanged = (message: string) => {
        queryClient.invalidateQueries({ queryKey: pagesQueryKey(tenantId) });
        builder.refreshPreview();
        NotificationHandler.showSuccess(message);
    };

    const saveMutation = useMutation({
        mutationFn: (data: InfoPageModalSubmit) =>
            editing?._id
                ? SAPI.PROFILE.TENANT.updatePage({ tenantId, pageId: editing._id, body: data })
                : SAPI.PROFILE.TENANT.createPage({ tenantId, body: data }),
        onSuccess: () => {
            onChanged(editing?._id ? t('SITE.INFOS.UPDATED') : t('SITE.INFOS.CREATED'));
            setEditing(undefined);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.deletePage,
        onSuccess: () => {
            onChanged(t('SITE.INFOS.DELETED'));
            setDeleting(undefined);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const pages = pagesQuery.data ?? [];
    const subdomain = builder.site?.subdomain;
    const isLive = !!subdomain && !!builder.site?.published;

    return (
        <>
            <InfoPageModal
                opened={editing !== undefined}
                page={editing ?? undefined}
                canPublish={canPublish}
                loading={saveMutation.isPending}
                onClose={() => setEditing(undefined)}
                onSubmit={(data) => saveMutation.mutate(data)}
            />
            <EDIDeleteDialog
                visible={!!deleting}
                title={t('COMMON.DELETE_TITLE')}
                description={t('COMMON.DELETE_DESCRIPTION')}
                type="CONFIRM"
                loading={deleteMutation.isPending}
                onClose={() => setDeleting(undefined)}
                onSubmit={() => deleting && deleteMutation.mutate({ tenantId, pageId: deleting._id })}
            />
            <Card withBorder radius="sm" p="lg">
                <Group justify="space-between" mb="md" align="flex-start">
                    <Box>
                        <Title order={3} c="violet">
                            {t('SITE.TABS.INFOS')}
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            {t('SITE.INFOS.DESCRIPTION')}
                        </Text>
                    </Box>
                    {canCreate && (
                        <Button onClick={() => setEditing(null)}>
                            <Text size="sm">{t('SITE.INFOS.ADD')}</Text>
                        </Button>
                    )}
                </Group>
                {pages.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                        {t('SITE.INFOS.EMPTY')}
                    </Text>
                ) : (
                    <Stack gap="sm">
                        {pages.map((page) => (
                            <Box
                                key={page._id}
                                p="sm"
                                style={{ borderRadius: 6, border: '1px solid var(--mantine-color-gray-2)' }}
                            >
                                <Group justify="space-between" wrap="nowrap" gap="sm">
                                    <Box style={{ minWidth: 0 }}>
                                        <Group gap={6} wrap="nowrap">
                                            <Text fw={600} size="sm" truncate>
                                                {page.title}
                                            </Text>
                                            <Badge
                                                size="xs"
                                                variant="light"
                                                radius="sm"
                                                color={page.status === PROFILE_OBJECT_STATUS.PUBLISHED ? 'green' : 'gray'}
                                            >
                                                {page.status === PROFILE_OBJECT_STATUS.PUBLISHED
                                                    ? t('PROFILE.OBJECTS.STATUS.PUBLISHED')
                                                    : t('PROFILE.OBJECTS.STATUS.DRAFT')}
                                            </Badge>
                                        </Group>
                                        <Text size="xs" c={page.status === PROFILE_OBJECT_STATUS.PUBLISHED ? 'dimmed' : 'orange.7'} truncate>
                                            {page.status === PROFILE_OBJECT_STATUS.PUBLISHED
                                                ? `/p/${page.slug} · ${dayjs(page.updatedAt).format('DD.MM.YYYY')}`
                                                : t('SITE.INFOS.DRAFT_HINT')}
                                        </Text>
                                    </Box>
                                    <Group gap="sm" wrap="nowrap">
                                        {isLive && page.status === PROFILE_OBJECT_STATUS.PUBLISHED && (
                                            <Tooltip label={t('SITE.BUILDER.OPEN_PUBLIC')} withArrow>
                                                <ActionIcon
                                                    variant="subtle"
                                                    size="sm"
                                                    component="a"
                                                    href={`${buildSiteUrl(subdomain!)}/p/${page.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <IconExternalLink size={24} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {canEdit && (
                                            <ActionIcon variant="subtle" size="sm" onClick={() => setEditing(page)} aria-label={t('COMMON.EDIT')}>
                                                <IconEdit size={24} />
                                            </ActionIcon>
                                        )}
                                        {canDelete && (
                                            <ActionIcon
                                                variant="subtle"
                                                size="sm"
                                                color="red"
                                                onClick={() => setDeleting(page)}
                                                aria-label={t('COMMON.DELETE')}
                                            >
                                                <IconTrash size={24} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Group>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Card>
        </>
    );
};

export default InfosTab;
