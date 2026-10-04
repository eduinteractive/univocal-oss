import {
    ActionIcon,
    Anchor,
    Badge,
    Card,
    Group,
    SegmentedControl,
    Select,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
} from '@mantine/core';
import {
    IconArrowBackUp,
    IconCheck,
    IconInbox,
    IconMail,
    IconMessageQuestion,
    IconTrash,
    IconUserPlus,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ProfileSupportRequest,
    SAPI,
    SUPPORT_RESPONSE_KIND,
    SUPPORT_RESPONSE_STATUS,
} from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportRequestsQueryKey, supportResponsesQueryKey } from './useSiteBuilder';

interface SupportInboxProps {
    tenantId?: string;
    requests: ProfileSupportRequest[];
    requestId?: string;
    onRequestChange: (requestId?: string) => void;
    canEdit: boolean;
    canDelete: boolean;
}

type StatusFilter = SUPPORT_RESPONSE_STATUS | 'ALL';

const SupportInbox = ({ tenantId, requests, requestId, onRequestChange, canEdit, canDelete }: SupportInboxProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(SUPPORT_RESPONSE_STATUS.OPEN);

    const responsesQuery = useQuery({
        queryKey: [...supportResponsesQueryKey(tenantId), requestId, statusFilter],
        queryFn: () =>
            SAPI.PROFILE.TENANT.getSupportResponses({
                tenantId,
                requestId,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
            }),
        enabled: !!tenantId,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: supportResponsesQueryKey(tenantId) });
        queryClient.invalidateQueries({ queryKey: supportRequestsQueryKey(tenantId) });
    };

    const statusMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateSupportResponse,
        onSuccess: invalidate,
        onError: NotificationHandler.showAxiosError,
    });

    const deleteMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.deleteSupportResponse,
        onSuccess: () => {
            invalidate();
            NotificationHandler.showSuccess(t('SITE.SUPPORT.INBOX.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const requestTitles = new Map(requests.map((request) => [request._id, request.title]));
    const responses = responsesQuery.data ?? [];

    return (
        <Stack gap="md">
            <Group justify="space-between" gap="sm">
                <Select
                    w={{ base: '100%', sm: 320 }}
                    clearable
                    placeholder={t('SITE.SUPPORT.INBOX.ALL_REQUESTS')}
                    value={requestId ?? null}
                    onChange={(value) => onRequestChange(value ?? undefined)}
                    data={requests.map((request) => ({ value: request._id, label: request.title }))}
                />
                <SegmentedControl
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as StatusFilter)}
                    data={[
                        { value: SUPPORT_RESPONSE_STATUS.OPEN, label: t('SITE.SUPPORT.INBOX.OPEN') },
                        { value: SUPPORT_RESPONSE_STATUS.DONE, label: t('SITE.SUPPORT.INBOX.DONE') },
                        { value: 'ALL', label: t('COMMON.ALL') },
                    ]}
                />
            </Group>

            {responses.length === 0 ? (
                <Card withBorder radius="md" p="xl">
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="navy.9">
                            <IconInbox size={26} />
                        </ThemeIcon>
                        <Text c="dimmed" size="sm" ta="center">
                            {responsesQuery.isLoading ? t('COMMON.WAIT') : t('SITE.SUPPORT.INBOX.EMPTY')}
                        </Text>
                    </Stack>
                </Card>
            ) : (
                responses.map((response) => {
                    const isOffer = response.kind === SUPPORT_RESPONSE_KIND.OFFER;
                    const isDone = response.status === SUPPORT_RESPONSE_STATUS.DONE;
                    const requestTitle = requestTitles.get(response.requestId) ?? '';
                    return (
                        <Card key={response._id} withBorder radius="md" p="md" opacity={isDone ? 0.7 : 1}>
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
                                    <Group gap="xs">
                                        <Badge
                                            variant="light"
                                            color={isOffer ? 'green' : 'blue'}
                                            leftSection={
                                                isOffer ? <IconUserPlus size={12} /> : <IconMessageQuestion size={12} />
                                            }
                                        >
                                            {isOffer ? t('SITE.SUPPORT.INBOX.OFFER') : t('SITE.SUPPORT.INBOX.QUESTION')}
                                        </Badge>
                                        <Text size="xs" c="dimmed">
                                            {dayjs(response.createdAt).format('DD.MM.YYYY HH:mm')}
                                        </Text>
                                    </Group>
                                    <Text size="xs" c="dimmed" truncate>
                                        {t('SITE.SUPPORT.INBOX.FOR', { title: requestTitle })}
                                    </Text>
                                    <Text fw={600} size="sm">
                                        {response.name || t('SITE.SUPPORT.INBOX.ANONYMOUS')}
                                        {response.email && (
                                            <>
                                                {' · '}
                                                <Anchor href={`mailto:${response.email}`} size="sm">
                                                    {response.email}
                                                </Anchor>
                                            </>
                                        )}
                                    </Text>
                                    <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                                        {response.message}
                                    </Text>
                                </Stack>
                                <Group gap="sm" wrap="nowrap">
                                    {response.email && (
                                        <Tooltip label={t('SITE.SUPPORT.INBOX.REPLY')} withArrow>
                                            <ActionIcon
                                                variant="subtle"
                                                component="a"
                                                href={`mailto:${response.email}?subject=${encodeURIComponent(`Re: ${requestTitle}`)}`}
                                            >
                                                <IconMail size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {canEdit && (
                                        <Tooltip
                                            label={isDone ? t('SITE.SUPPORT.INBOX.REOPEN') : t('SITE.SUPPORT.INBOX.MARK_DONE')}
                                            withArrow
                                        >
                                            <ActionIcon
                                                variant="subtle"
                                                color={isDone ? 'gray' : 'green'}
                                                onClick={() =>
                                                    statusMutation.mutate({
                                                        tenantId,
                                                        responseId: response._id,
                                                        status: isDone
                                                            ? SUPPORT_RESPONSE_STATUS.OPEN
                                                            : SUPPORT_RESPONSE_STATUS.DONE,
                                                    })
                                                }
                                            >
                                                {isDone ? <IconArrowBackUp size={16} /> : <IconCheck size={16} />}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {canDelete && (
                                        <Tooltip label={t('COMMON.DELETE')} withArrow>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() =>
                                                    deleteMutation.mutate({ tenantId, responseId: response._id })
                                                }
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Group>
                        </Card>
                    );
                })
            )}
        </Stack>
    );
};

export default SupportInbox;
