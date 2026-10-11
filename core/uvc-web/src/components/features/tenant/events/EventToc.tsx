import {
    ActionIcon,
    Button,
    Card,
    Group,
    Stack,
    Text,
    Title,
    UnstyledButton,
} from '@mantine/core';
import { SVHEvent, SVHEventSession } from '@eduinteractive/uvc-api';
import { EDIModal, EDITextInput, NotificationHandler } from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import {
    IconArrowDown,
    IconArrowUp,
    IconDownload,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import SVHMultiDropzone from '../../../common/SVHMultiDropzone';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SVHTextEditor from '../../../common/SVHTextEditor';
import { legalHtmlIsEmpty } from '../../site/legalHtml';
import SessionDescription from './SessionDescription';
import SVHDateTimePicker from '../../../common/SVHDateTimePicker';
import dayjs from 'dayjs';

interface EventTocSubmitData {
    config: {
        toc: {
            enabled?: boolean;
            content?: string;
            materials?: {
                title: string;
                link: string;
                mimetype: string;
            }[];
            sessions?: SVHEventSession[];
            newUploads?: File[];
        };
    };
}

interface EventTocProps {
    event: SVHEvent;
    onUpdate: (data: EventTocSubmitData) => void;
}

interface SessionDraft {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    place: string;
    description: string;
}

const createSessionId = () => {
    try {
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    } catch {
        // randomUUID is unavailable on plain HTTP origins.
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const emptyDraft = (): SessionDraft => ({
    id: createSessionId(),
    title: '',
    start: null,
    end: null,
    place: '',
    description: '',
});

const EventToc = (props: EventTocProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const canEdit =
        !!currentTenant &&
        (checkPermission(currentTenant, 'event:edit') ||
            props.event.authorId === authData?._id);
    const [materials, setMaterials] = useState(
        props.event.config.toc.materials || []
    );
    const [newUploads, setNewUploads] = useState<File[]>([]);
    const [draft, setDraft] = useState<SessionDraft | null>(null);

    useEffect(() => {
        setMaterials(props.event.config.toc.materials || []);
    }, [props.event]);

    const sessions = props.event.config.toc.sessions ?? [];

    const persistSessions = (next: SVHEventSession[]) => {
        props.onUpdate({
            config: {
                toc: {
                    sessions: next,
                },
            },
        });
    };

    const saveDraft = () => {
        if (!draft?.title.trim() || !draft.start) {
            NotificationHandler.showError(t('EVENTS.SESSION_REQUIRED'));
            return;
        }
        if (draft.end && dayjs(draft.end).isBefore(draft.start)) {
            NotificationHandler.showError(t('EVENTS.SESSION_END_BEFORE_START'));
            return;
        }
        const session: SVHEventSession = {
            id: draft.id,
            title: draft.title.trim(),
            start: draft.start,
            ...(draft.end ? { end: draft.end } : {}),
            place: draft.place.trim(),
            description: legalHtmlIsEmpty(draft.description) ? '' : draft.description,
        };
        const exists = sessions.some((item) => item.id === session.id);
        persistSessions(
            exists
                ? sessions.map((item) => (item.id === session.id ? session : item))
                : [...sessions, session]
        );
        setDraft(null);
    };

    const moveSession = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sessions.length) return;
        const next = [...sessions];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        persistSessions(next);
    };

    const savedMaterials = props.event.config.toc.materials || [];
    const materialsDirty = JSON.stringify(materials) !== JSON.stringify(savedMaterials) || newUploads.length > 0;
    const editingSession = draft ? sessions.find((session) => session.id === draft.id) : undefined;

    return (
        <Stack gap="xl">
            <Card withBorder radius="sm" p="xl">
            <Title order={3} c="violet" mb={4}>{t('EVENTS.AGENDA')}</Title>
            <Text size="sm" c="dimmed" mb="md">{t('EVENTS.AGENDA_HINT')}</Text>
            <Stack gap="sm">
            {!canEdit && sessions.length === 0 && (
                <Text size="sm" c="dimmed">{t('EVENTS.AGENDA_EMPTY')}</Text>
            )}
            {sessions.map((session, index) => (
                <Card key={session.id} withBorder radius="sm" p="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap={2}>
                            <Text size="xs" c="dimmed">
                                {dayjs(session.start).format('DD.MM.YYYY HH:mm')}
                                {session.end ? ` – ${dayjs(session.end).format('HH:mm')}` : ''}
                                {session.place ? ` · ${session.place}` : ''}
                            </Text>
                            <Text fw={600}>{session.title}</Text>
                            <SessionDescription html={session.description} />
                        </Stack>
                        {canEdit && <Group gap={4} wrap="nowrap">
                            <ActionIcon variant="subtle" aria-label={t('EVENTS.SESSION_UP')} onClick={() => moveSession(index, -1)}>
                                <IconArrowUp size={18} stroke={1.5} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" aria-label={t('EVENTS.SESSION_DOWN')} onClick={() => moveSession(index, 1)}>
                                <IconArrowDown size={18} stroke={1.5} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                aria-label={t('EVENTS.SESSION_EDIT')}
                                onClick={() => setDraft({
                                    id: session.id,
                                    title: session.title,
                                    start: dayjs(session.start).toDate(),
                                    end: session.end ? dayjs(session.end).toDate() : null,
                                    place: session.place ?? '',
                                    description: session.description ?? '',
                                })}
                            >
                                <IconEdit size={18} stroke={1.5} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                aria-label={t('EVENTS.SESSION_DELETE')}
                                onClick={() => persistSessions(sessions.filter((item) => item.id !== session.id))}
                            >
                                <IconTrash size={18} stroke={1.5} />
                            </ActionIcon>
                        </Group>}
                    </Group>
                </Card>
            ))}
            {canEdit && <UnstyledButton
                onClick={() => setDraft(emptyDraft())}
                w="100%"
                p="md"
                ta="left"
                style={{
                    borderRadius: 'var(--mantine-radius-sm)',
                    border: '1px dashed var(--mantine-color-violet-3)',
                    background: 'var(--mantine-color-violet-0)',
                }}
            >
                <Text size="sm" c="violet" fw={600}>
                    {t('EVENTS.SESSION_ADD')}
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                    {t('EVENTS.SESSION_ADD_HINT')}
                </Text>
            </UnstyledButton>}
            </Stack>
            </Card>
            <EDIModal
                visible={!!draft}
                onClose={() => setDraft(null)}
                onSubmit={saveDraft}
                title={editingSession ? t('EVENTS.SESSION_EDIT') : t('EVENTS.SESSION_ADD')}
                type="DEFAULT"
                isForm
            >
                {draft && (
                    <>
                        <EDITextInput
                            label={t('EVENTS.SESSION_TITLE')}
                            placeholder={t('EVENTS.SESSION_TITLE_PLACEHOLDER')}
                            value={draft.title}
                            onChange={(event) => setDraft({ ...draft, title: event.currentTarget.value })}
                            required
                        />
                        <SVHDateTimePicker
                            label={t('EVENTS.SESSION_START')}
                            placeholder={t('EVENTS.SESSION_START_PLACEHOLDER')}
                            value={draft.start}
                            onChange={(value) => setDraft({ ...draft, start: value })}
                            required
                        />
                        <SVHDateTimePicker
                            label={t('EVENTS.SESSION_END')}
                            placeholder={t('EVENTS.SESSION_END_PLACEHOLDER')}
                            value={draft.end}
                            onChange={(value) => setDraft({ ...draft, end: value })}
                            clearable
                        />
                        <EDITextInput
                            label={t('EVENTS.SESSION_PLACE')}
                            placeholder={t('EVENTS.SESSION_PLACE_PLACEHOLDER')}
                            value={draft.place}
                            onChange={(event) => setDraft({ ...draft, place: event.currentTarget.value })}
                        />
                        <SVHTextEditor
                            text={draft.description}
                            onChange={(description) =>
                                setDraft((current) => (current ? { ...current, description } : current))
                            }
                        />
                    </>
                )}
            </EDIModal>
            {props.event.config.toc.content && (
                <Card withBorder radius="sm" p="xl">
                    <Group justify="space-between" align="flex-start" mb="md">
                        <Title order={3} c="violet">{t('EVENTS.LEGACY_PROGRAM')}</Title>
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={() => props.onUpdate({ config: { toc: { content: '' } } })}
                        >
                            {t('EVENTS.LEGACY_PROGRAM_CLEAR')}
                        </Button>
                    </Group>
                    <div dangerouslySetInnerHTML={{ __html: props.event.config.toc.content }} />
                </Card>
            )}
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.MATERIALS')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.MATERIALS_HINT')}
                </Text>
                <Stack gap="xs" mt={materials.length > 0 ? 'sm' : 0}>
                {materials.map((material) => (
                    <Card key={material.link} withBorder radius="sm" p="sm">
                        <Group justify="space-between" wrap="nowrap">
                            <Text size="sm">{material.title}</Text>
                            <Group gap="xs" wrap="nowrap">
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() =>
                                        window.open(
                                            `${import.meta.env.VITE_KUBERNETES_HOST}/api/event/tenant/${currentTenant?._id}/event/${props.event._id}/download/${encodeURIComponent(material.link)}`,
                                            '_blank'
                                        )
                                    }
                                >
                                    <IconDownload size={18} stroke={1.5} />
                                </ActionIcon>
                                {checkPermission(currentTenant!, 'event:edit') && (
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() => setMaterials(materials.filter((item) => item.link !== material.link))}
                                    >
                                        <IconTrash size={18} stroke={1.5} />
                                    </ActionIcon>
                                )}
                            </Group>
                        </Group>
                    </Card>
                ))}
                </Stack>
                {checkPermission(currentTenant!, 'event:edit') && (
                    <SVHMultiDropzone
                        value={[]}
                        onSelected={setNewUploads}
                        onRemove={() => setNewUploads([])}
                    />
                )}
                <Group justify="flex-end" gap="xs" mt="lg">
                    <Button
                        disabled={!materialsDirty}
                        onClick={() => props.onUpdate({
                            config: {
                                toc: {
                                    materials,
                                    newUploads,
                                },
                            },
                        })}
                    >
                        {t('SITE.SAVE')}
                    </Button>
                </Group>
            </Card>
        </Stack>
    );
};

export default EventToc;
