import { Box, Button, Card, Flex, Group, SegmentedControl, SimpleGrid, Stack, Switch, Text, Title } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconDeviceDesktop, IconDeviceMobile, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { EventAccent, SITE_LAYOUTS, SITE_PALETTES, SiteLayoutPreset, SitePalette, SVHEvent, SVHPublicEvent } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../context/TenantContext';
import PaletteSwatch from '../../site/PaletteSwatch';
import { EventModuleCard, eventModuleOptions } from './EventModulePicker';
import { selectedEventPalette } from './eventAccent';
import EventPreviewCanvas, { PreviewDevice } from './EventPreviewCanvas';

interface EventSettingsSubmit {
    place?: {
        name: string;
        address: string;
    };
    config?: {
        toc?: { enabled: boolean };
        registration?: { enabled: boolean };
        accreditation?: { enabled: boolean };
        public?: {
            accent?: EventAccent;
            layout?: SiteLayoutPreset;
            published?: boolean;
            coverKey?: string | null;
            coverFile?: File;
        };
    };
}

interface EventSettingsProps {
    event: SVHEvent;
    saving?: boolean;
    onUpdate: (data: EventSettingsSubmit) => void;
}

const EventSettings = (props: EventSettingsProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [device, setDevice] = useState<PreviewDevice>('desktop');

    useEffect(() => {
        return () => {
            if (coverPreview) URL.revokeObjectURL(coverPreview);
        };
    }, [coverPreview]);

    const published = props.event.config.public?.published !== false;
    const accent = props.event.config.public?.accent;
    const savedPalette = selectedEventPalette(accent);
    const savedLayout: SiteLayoutPreset = SITE_LAYOUTS.includes(props.event.config.public?.layout as SiteLayoutPreset)
        ? props.event.config.public!.layout!
        : 'compact';
    const [draftPalette, setDraftPalette] = useState<SitePalette>(savedPalette);
    const [draftLayout, setDraftLayout] = useState<SiteLayoutPreset>(savedLayout);

    useEffect(() => {
        setDraftPalette(savedPalette);
        setDraftLayout(savedLayout);
    }, [savedPalette, savedLayout]);

    const appearanceDirty = draftPalette !== savedPalette || draftLayout !== savedLayout;
    const coverKey = props.event.config.public?.coverKey;
    const coverUrl = coverKey
        ? `${import.meta.env.VITE_KUBERNETES_HOST}/api/event/tenant/${currentTenant?._id}/event/${props.event._id}/download/${encodeURIComponent(coverKey)}`
        : null;
    const previewEvent: SVHPublicEvent = {
        tenantId: props.event.tenantId,
        title: props.event.title,
        description: props.event.description,
        startDate: props.event.startDate,
        endDate: props.event.endDate,
        place: props.event.place,
        spotsRemaining: null,
        config: {
            ...props.event.config,
            public: {
                coverKey: props.event.config.public?.coverKey ?? '',
                accent: draftPalette,
                layout: draftLayout,
                published,
            },
        },
    };

    const enabled: Record<(typeof eventModuleOptions)[number]['id'], boolean> = {
        program: props.event.config.toc.enabled,
        registration: props.event.config.registration.enabled,
        checkin: props.event.config.accreditation.enabled,
    };

    const toggleModule = (id: (typeof eventModuleOptions)[number]['id']) => {
        const next = !enabled[id];
        if (id === 'program') props.onUpdate({ config: { toc: { enabled: next } } });
        if (id === 'registration') props.onUpdate({ config: { registration: { enabled: next } } });
        if (id === 'checkin') props.onUpdate({ config: { accreditation: { enabled: next } } });
    };

    return (
        <Stack gap="xl">
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.SETTINGS_MODULES')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.MODULES.HINT')}
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                    {eventModuleOptions.map((option) => (
                        <EventModuleCard
                            key={option.id}
                            icon={option.icon}
                            color={option.color}
                            title={t(option.titleKey)}
                            description={t(option.descriptionKey)}
                            active={enabled[option.id]}
                            onClick={() => toggleModule(option.id)}
                        />
                    ))}
                </SimpleGrid>
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
                        checked={published}
                        aria-label={t('SITE.SETTINGS.PUBLISH_TITLE')}
                        onChange={(event) =>
                            props.onUpdate({
                                config: {
                                    public: { published: event.currentTarget.checked },
                                },
                            })
                        }
                    />
                </Group>
            </Card>
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.SETTINGS_PUBLIC')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.SETTINGS_PUBLIC_HINT')}
                </Text>
                <Stack gap="lg">
                    <Stack gap="xs">
                        <Text size="sm" fw={600}>
                            {t('SITE.SETTINGS.APPEARANCE.PALETTE_LABEL')}
                        </Text>
                        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
                            {SITE_PALETTES.map((item) => (
                                <PaletteSwatch
                                    key={item}
                                    palette={item}
                                    selected={draftPalette === item}
                                    onSelect={() => setDraftPalette(item)}
                                />
                            ))}
                        </SimpleGrid>
                    </Stack>
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text size="sm" fw={600}>{t('EVENTS.COVER')}</Text>
                            {(coverPreview || coverKey) && (
                                <Button
                                    variant="subtle"
                                    color="gray"
                                    size="compact-sm"
                                    onClick={() => {
                                        setCoverPreview(null);
                                        props.onUpdate({ config: { public: { coverKey: null, accent } } });
                                    }}
                                >
                                    {t('EVENTS.COVER_REMOVE')}
                                </Button>
                            )}
                        </Group>
                        {(coverPreview || coverUrl) && (
                            <img
                                src={coverPreview || coverUrl || undefined}
                                alt=""
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: 160,
                                    objectFit: 'cover',
                                    borderRadius: 'var(--mantine-radius-sm)',
                                }}
                            />
                        )}
                        <Dropzone
                            accept={IMAGE_MIME_TYPE}
                            maxSize={5 * 1024 ** 2}
                            maxFiles={1}
                            onDrop={(files) => {
                                const file = files[0];
                                if (!file) return;
                                setCoverPreview(URL.createObjectURL(file));
                                props.onUpdate({ config: { public: { coverFile: file, accent } } });
                            }}
                            onReject={() => NotificationHandler.showError(t('COMMON.DROPZONE_TO_BIG'))}
                        >
                            <Group justify="center" gap="md" mih={80} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <IconUpload size={32} stroke={1.5} color="var(--mantine-color-violet-filled)" />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX size={32} stroke={1.5} color="var(--mantine-color-red-filled)" />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconPhoto size={32} stroke={1.5} color="var(--mantine-color-violet-filled)" />
                                </Dropzone.Idle>
                                <div>
                                    <Text size="sm" fw={600}>{t('COMMON.DROPZONE_IMAGE')}</Text>
                                    <Text size="xs" c="dimmed">{t('COMMON.DROPZONE_IMAGE_MAX_SIZE')}</Text>
                                </div>
                            </Group>
                        </Dropzone>
                    </Stack>
                    <Stack gap="xs">
                        <Text size="sm" fw={600}>
                            {t('SITE.SETTINGS.APPEARANCE.LAYOUT_LABEL')}
                        </Text>
                        <SegmentedControl
                            fullWidth
                            value={draftLayout}
                            onChange={(value) => setDraftLayout(value as SiteLayoutPreset)}
                            data={SITE_LAYOUTS.map((layout) => ({
                                value: layout,
                                label: t(`SITE.SETTINGS.APPEARANCE.LAYOUTS.${layout}.LABEL`),
                            }))}
                        />
                        <Text size="xs" c="dimmed">
                            {t(`SITE.SETTINGS.APPEARANCE.LAYOUTS.${draftLayout}.HINT`)}
                        </Text>
                    </Stack>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" fw={600}>
                                {t('SITE.SETTINGS.APPEARANCE.PREVIEW')}
                            </Text>
                            <SegmentedControl
                                size="xs"
                                value={device}
                                onChange={(value) => setDevice(value as PreviewDevice)}
                                data={[
                                    {
                                        value: 'desktop',
                                        label: <IconDeviceDesktop size={16} aria-label={t('SITE.BUILDER.DESKTOP')} />,
                                    },
                                    {
                                        value: 'mobile',
                                        label: <IconDeviceMobile size={16} aria-label={t('SITE.BUILDER.MOBILE')} />,
                                    },
                                ]}
                            />
                        </Group>
                        <EventPreviewCanvas
                            event={previewEvent}
                            eventId={props.event._id}
                            coverUrl={coverPreview || coverUrl}
                            device={device}
                        />
                    </Stack>
                    <Group justify="flex-end" gap="xs">
                        <Button
                            variant="subtle"
                            color="gray"
                            disabled={!appearanceDirty}
                            onClick={() => {
                                setDraftPalette(savedPalette);
                                setDraftLayout(savedLayout);
                            }}
                        >
                            {t('SITE.SETTINGS.APPEARANCE.RESET')}
                        </Button>
                        <Button
                            disabled={!appearanceDirty}
                            loading={props.saving}
                            onClick={() =>
                                props.onUpdate({
                                    config: {
                                        public: {
                                            accent: draftPalette,
                                            layout: draftLayout,
                                        },
                                    },
                                })
                            }
                        >
                            {t('SITE.SAVE')}
                        </Button>
                    </Group>
                </Stack>
            </Card>
            <Flex align="end" justify="end" direction="column">
                <Text size="sm" c="dimmed">
                    {t('EVENTS.META.CREATED_AT')}:
                    {dayjs(props.event.createdAt).format('DD.MM.YYYY HH:mm')}
                </Text>
                <Text size="sm" c="dimmed">
                    {t('EVENTS.META.UPDATED_AT')}:
                    {dayjs(props.event.updatedAt).format('DD.MM.YYYY HH:mm')}
                </Text>
            </Flex>
        </Stack>
    );
};

export default EventSettings;
