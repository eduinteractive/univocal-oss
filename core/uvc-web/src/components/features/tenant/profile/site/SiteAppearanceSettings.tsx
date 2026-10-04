import {
    Box,
    Button,
    Card,
    Group,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Title,
    UnstyledButton,
} from '@mantine/core';
import { IconCheck, IconDeviceDesktop, IconDeviceMobile } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
    ProfileSite,
    ProfileSiteAppearance,
    SAPI,
    SITE_LAYOUTS,
    SITE_PALETTES,
    SiteLayoutPreset,
    SitePalette,
} from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveAppearance, SITE_PALETTE_TOKENS } from '../../../site/siteTheme';
import SitePreviewCanvas, { PreviewDevice } from './SitePreviewCanvas';

interface SiteAppearanceSettingsProps {
    site?: ProfileSite;
    tenantId?: string;
    canEdit: boolean;
    saving: boolean;
    onSave: (appearance: ProfileSiteAppearance) => void;
}

const PaletteSwatch = ({
    palette,
    selected,
    disabled,
    onSelect,
}: {
    palette: SitePalette;
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
}) => {
    const { t } = useTranslation();
    const tokens = SITE_PALETTE_TOKENS[palette];
    return (
        <UnstyledButton
            onClick={onSelect}
            disabled={disabled}
            aria-pressed={selected}
            p="xs"
            style={{
                borderRadius: 'var(--mantine-radius-md)',
                border: `2px solid ${selected ? tokens.primary : 'var(--mantine-color-gray-3)'}`,
                transition: 'border-color 200ms ease',
            }}
        >
            <Group gap="sm" wrap="nowrap">
                <Box
                    w={40}
                    h={40}
                    style={{
                        flexShrink: 0,
                        borderRadius: 'var(--mantine-radius-md)',
                        background: `linear-gradient(135deg, ${tokens.primary} 0 50%, ${tokens.accent} 50% 100%)`,
                        boxShadow: `inset 0 -10px 0 ${tokens.soft}`,
                    }}
                />
                <Text size="sm" fw={600} style={{ flex: 1 }}>
                    {t(`SITE.SETTINGS.APPEARANCE.PALETTES.${palette}`)}
                </Text>
                {selected && <IconCheck size={18} color={tokens.primary} aria-hidden />}
            </Group>
        </UnstyledButton>
    );
};

const SiteAppearanceSettings = ({ site, tenantId, canEdit, saving, onSave }: SiteAppearanceSettingsProps) => {
    const { t } = useTranslation();
    const saved = resolveAppearance(site?.appearance);
    const [draft, setDraft] = useState<ProfileSiteAppearance>(saved);
    const [device, setDevice] = useState<PreviewDevice>('desktop');

    useEffect(() => {
        setDraft(saved);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saved.palette, saved.layout]);

    const previewQuery = useQuery({
        queryKey: ['profile-site-preview', tenantId],
        queryFn: () => SAPI.PROFILE.TENANT.getSitePreview(tenantId),
        enabled: !!tenantId,
    });

    const dirty = draft.palette !== saved.palette || draft.layout !== saved.layout;
    const preview = previewQuery.data;

    return (
        <Card withBorder radius="sm" p="xl">
            <Title order={3} c="blue" mb={4}>
                {t('SITE.SETTINGS.APPEARANCE.TITLE')}
            </Title>
            <Text size="sm" c="dimmed" mb="md">
                {t('SITE.SETTINGS.APPEARANCE.DESCRIPTION')}
            </Text>

            <Stack gap="lg">
                <Stack gap="xs">
                    <Text size="sm" fw={600}>
                        {t('SITE.SETTINGS.APPEARANCE.PALETTE_LABEL')}
                    </Text>
                    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
                        {SITE_PALETTES.map((palette) => (
                            <PaletteSwatch
                                key={palette}
                                palette={palette}
                                selected={draft.palette === palette}
                                disabled={!canEdit}
                                onSelect={() => setDraft((current) => ({ ...current, palette }))}
                            />
                        ))}
                    </SimpleGrid>
                </Stack>

                <Stack gap="xs">
                    <Text size="sm" fw={600}>
                        {t('SITE.SETTINGS.APPEARANCE.LAYOUT_LABEL')}
                    </Text>
                    <SegmentedControl
                        fullWidth
                        disabled={!canEdit}
                        value={draft.layout}
                        onChange={(layout) =>
                            setDraft((current) => ({ ...current, layout: layout as SiteLayoutPreset }))
                        }
                        data={SITE_LAYOUTS.map((layout) => ({
                            value: layout,
                            label: t(`SITE.SETTINGS.APPEARANCE.LAYOUTS.${layout}.LABEL`),
                        }))}
                    />
                    <Text size="xs" c="dimmed">
                        {t(`SITE.SETTINGS.APPEARANCE.LAYOUTS.${draft.layout}.HINT`)}
                    </Text>
                </Stack>

                {preview && (
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
                        <SitePreviewCanvas
                            data={{ ...preview, site: { ...preview.site, appearance: draft } }}
                            device={device}
                            maxHeight={480}
                        />
                    </Stack>
                )}

                <Group justify="flex-end" gap="xs">
                    <Button variant="subtle" color="gray" disabled={!dirty} onClick={() => setDraft(saved)}>
                        {t('SITE.SETTINGS.APPEARANCE.RESET')}
                    </Button>
                    <Button disabled={!canEdit || !dirty} loading={saving} onClick={() => onSave(draft)}>
                        {t('SITE.SAVE')}
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
};

export default SiteAppearanceSettings;
