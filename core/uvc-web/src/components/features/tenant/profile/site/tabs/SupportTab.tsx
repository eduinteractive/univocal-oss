import { ActionIcon, Badge, Button, Group, SegmentedControl, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconInbox, IconLock, IconLockOpen, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PROFILE_SECTION_TYPE,
    ProfileSupportRequest,
    SAPI,
    SUPPORT_REQUEST_STATUS,
} from '@eduinteractive/uvc-api';
import { EDIDeleteDialog, NotificationHandler } from '@eduinteractive/mantine-common';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../../../context/TenantContext';
import { checkPermission } from '../../../../../../utils/Permission';
import FeaturePicker, { FeatureItem } from '../FeaturePicker';
import SupportInbox from '../SupportInbox';
import SupportRequestModal, { SupportRequestModalSubmit } from '../SupportRequestModal';
import {
    SiteBuilder,
    supportRequestsQueryKey,
    supportResponsesQueryKey,
    useSupportRequests,
} from '../useSiteBuilder';

const STATUS_COLOR: Record<SUPPORT_REQUEST_STATUS, string> = {
    [SUPPORT_REQUEST_STATUS.DRAFT]: 'gray',
    [SUPPORT_REQUEST_STATUS.PUBLISHED]: 'green',
    [SUPPORT_REQUEST_STATUS.CLOSED]: 'orange',
};

const SupportTab = ({ builder }: { builder: SiteBuilder }) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const queryClient = useQueryClient();
    const tenantId = builder.tenantId;
    const [view, setView] = useState<'requests' | 'inbox'>('requests');
    const [inboxRequestId, setInboxRequestId] = useState<string | undefined>();
    const [editing, setEditing] = useState<ProfileSupportRequest | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<ProfileSupportRequest | undefined>();

    const canCreate = checkPermission(currentTenant!, 'profile_objects:create');
    const canEdit = checkPermission(currentTenant!, 'profile_objects:edit');
    const canDelete = checkPermission(currentTenant!, 'profile_objects:delete');
    const canPublish = checkPermission(currentTenant!, 'profile_objects:publish');
    const canSeeInbox = canEdit || canDelete;

    const requestsQuery = useSupportRequests(tenantId);
    const requests = requestsQuery.data ?? [];
    const openTotal = requests.reduce((sum, request) => sum + (request.openResponseCount ?? 0), 0);

    const onChanged = (message: string) => {
        queryClient.invalidateQueries({ queryKey: supportRequestsQueryKey(tenantId) });
        builder.refreshPreview();
        NotificationHandler.showSuccess(message);
    };

    const saveMutation = useMutation({
        mutationFn: (data: SupportRequestModalSubmit) =>
            editing?._id
                ? SAPI.PROFILE.TENANT.updateSupportRequest({ tenantId, requestId: editing._id, body: data })
                : SAPI.PROFILE.TENANT.createSupportRequest({ tenantId, body: data }),
        onSuccess: () => {
            onChanged(editing?._id ? t('SITE.SUPPORT.UPDATED') : t('SITE.SUPPORT.CREATED'));
            setEditing(undefined);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const statusMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateSupportRequest,
        onSuccess: () => onChanged(t('SITE.SUPPORT.UPDATED')),
        onError: NotificationHandler.showAxiosError,
    });

    const deleteMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.deleteSupportRequest,
        onSuccess: () => {
            onChanged(t('SITE.SUPPORT.DELETED'));
            queryClient.invalidateQueries({ queryKey: supportResponsesQueryKey(tenantId) });
            setDeleting(undefined);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const requestsById = new Map(requests.map((request) => [request._id, request]));

    const items: FeatureItem[] = requests.map((request) => ({
        id: request._id,
        title: request.title,
        meta: t('SITE.SUPPORT.META', {
            date: dayjs(request.publishDate ?? request.createdAt).format('DD.MM.YYYY'),
            count: request.responseCount ?? 0,
        }),
        badge: { label: t(`SITE.SUPPORT.STATUS.${request.status}`), color: STATUS_COLOR[request.status] },
        unavailableReason:
            request.status !== SUPPORT_REQUEST_STATUS.PUBLISHED ? t('SITE.SUPPORT.NOT_PUBLIC_HINT') : undefined,
    }));

    const openInbox = (requestId?: string) => {
        setInboxRequestId(requestId);
        setView('inbox');
    };

    return (
        <Stack gap="md">
            <SupportRequestModal
                opened={editing !== undefined}
                request={editing ?? undefined}
                canPublish={canPublish}
                loading={saveMutation.isPending}
                onClose={() => setEditing(undefined)}
                onSubmit={(data) => saveMutation.mutate(data)}
            />
            <EDIDeleteDialog
                visible={!!deleting}
                title={t('COMMON.DELETE_TITLE')}
                description={t('SITE.SUPPORT.DELETE_DESCRIPTION')}
                type="CONFIRM"
                loading={deleteMutation.isPending}
                onClose={() => setDeleting(undefined)}
                onSubmit={() => deleting && deleteMutation.mutate({ tenantId, requestId: deleting._id })}
            />

            {canSeeInbox && (
                <SegmentedControl
                    w="fit-content"
                    value={view}
                    onChange={(value) => setView(value as 'requests' | 'inbox')}
                    data={[
                        { value: 'requests', label: t('SITE.SUPPORT.REQUESTS') },
                        {
                            value: 'inbox',
                            label: (
                                <Group gap={6} wrap="nowrap">
                                    <IconInbox size={14} />
                                    {t('SITE.SUPPORT.INBOX.TITLE')}
                                    {openTotal > 0 && (
                                        <Badge size="xs" color="red" circle={openTotal < 10}>
                                            {openTotal}
                                        </Badge>
                                    )}
                                </Group>
                            ),
                        },
                    ]}
                />
            )}

            {view === 'inbox' && canSeeInbox ? (
                <SupportInbox
                    tenantId={tenantId}
                    requests={requests}
                    requestId={inboxRequestId}
                    onRequestChange={setInboxRequestId}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            ) : (
                <FeaturePicker
                    builder={builder}
                    type={PROFILE_SECTION_TYPE.SUPPORT}
                    items={items}
                    description={t('SITE.SUPPORT.SECTION_DESCRIPTION')}
                    fallbackHint={t('SITE.BUILDER.FALLBACK_LATEST')}
                    emptyText={t('SITE.SUPPORT.EMPTY')}
                    toolbar={
                        canCreate && (
                            <Button onClick={() => setEditing(null)}>
                                <Text size="sm">{t('SITE.SUPPORT.ADD')}</Text>
                            </Button>
                        )
                    }
                    renderActions={(item) => {
                        const request = requestsById.get(item.id)!;
                        const isClosed = request.status === SUPPORT_REQUEST_STATUS.CLOSED;
                        return (
                            <>
                                {canSeeInbox && (
                                    <Tooltip label={t('SITE.SUPPORT.INBOX.TITLE')} withArrow>
                                        <ActionIcon variant="subtle" size="sm" onClick={() => openInbox(request._id)} pos="relative">
                                            <IconInbox size={24} />
                                            {(request.openResponseCount ?? 0) > 0 && (
                                                <Badge
                                                    size="xs"
                                                    color="red"
                                                    circle
                                                    pos="absolute"
                                                    top={-4}
                                                    right={-4}
                                                    style={{ pointerEvents: 'none' }}
                                                >
                                                    {request.openResponseCount}
                                                </Badge>
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                                {canPublish && request.status !== SUPPORT_REQUEST_STATUS.DRAFT && (
                                    <Tooltip
                                        label={isClosed ? t('SITE.SUPPORT.REOPEN') : t('SITE.SUPPORT.CLOSE')}
                                        withArrow
                                    >
                                        <ActionIcon
                                            variant="subtle"
                                            size="sm"
                                            color={isClosed ? 'green' : 'orange'}
                                            onClick={() =>
                                                statusMutation.mutate({
                                                    tenantId,
                                                    requestId: request._id,
                                                    body: {
                                                        status: isClosed
                                                            ? SUPPORT_REQUEST_STATUS.PUBLISHED
                                                            : SUPPORT_REQUEST_STATUS.CLOSED,
                                                    },
                                                })
                                            }
                                        >
                                            {isClosed ? <IconLockOpen size={24} /> : <IconLock size={24} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                                {canEdit && (
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        onClick={() => setEditing(request)}
                                        aria-label={t('COMMON.EDIT')}
                                    >
                                        <IconEdit size={24} />
                                    </ActionIcon>
                                )}
                                {canDelete && (
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        color="red"
                                        onClick={() => setDeleting(request)}
                                        aria-label={t('COMMON.DELETE')}
                                    >
                                        <IconTrash size={24} />
                                    </ActionIcon>
                                )}
                            </>
                        );
                    }}
                />
            )}
        </Stack>
    );
};

export default SupportTab;
