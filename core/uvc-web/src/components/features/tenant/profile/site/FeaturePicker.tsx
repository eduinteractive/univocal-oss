import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Card,
    Group,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { IconInfoCircle, IconPin, IconPinnedOff, IconSearch } from '@tabler/icons-react';
import { PROFILE_SECTION_TYPE } from '@eduinteractive/uvc-api';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SortableList from './SortableList';
import { MAX_FEATURED, SiteBuilder } from './useSiteBuilder';

export interface FeatureItem {
    id: string;
    title: string;
    meta?: string;
    badge?: { label: string; color: string };
    /** Item cannot be shown publicly (e.g. draft or inactive survey). */
    unavailableReason?: string;
}

interface FeaturePickerProps {
    builder: SiteBuilder;
    type: PROFILE_SECTION_TYPE;
    items: FeatureItem[];
    loading?: boolean;
    description?: string;
    fallbackHint?: string;
    emptyText: string;
    toolbar?: ReactNode;
    renderActions?: (item: FeatureItem) => ReactNode;
}

const FeaturePicker = ({
    builder,
    type,
    items,
    description,
    fallbackHint,
    emptyText,
    toolbar,
    renderActions,
}: FeaturePickerProps) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const section = builder.getSection(type);
    const canEdit = builder.canEdit;

    const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
    const featured = section.featuredIds.map((id) => itemsById.get(id)).filter((item): item is FeatureItem => !!item);
    const filtered = items.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));

    const renderRow = (item: FeatureItem, handle?: ReactNode) => {
        const isFeatured = section.featuredIds.includes(item.id);
        return (
            <Box
                key={item.id}
                p="sm"
                bg={isFeatured ? 'violet.0' : undefined}
                style={{
                    borderRadius: 6,
                    border: '1px solid var(--mantine-color-gray-2)',
                }}
            >
                <Group justify="space-between" wrap="nowrap" gap="sm">
                    <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                        {handle}
                        <Box style={{ minWidth: 0 }}>
                            <Group gap={6} wrap="nowrap">
                                <Text fw={600} size="sm" truncate>
                                    {item.title}
                                </Text>
                                {item.badge && (
                                    <Badge size="xs" variant="light" radius="sm" color={item.badge.color}>
                                        {item.badge.label}
                                    </Badge>
                                )}
                            </Group>
                            {(item.meta || item.unavailableReason) && (
                                <Text size="xs" c={item.unavailableReason ? 'orange.7' : 'dimmed'} truncate>
                                    {item.unavailableReason ?? item.meta}
                                </Text>
                            )}
                        </Box>
                    </Group>
                    <Group gap="sm" wrap="nowrap">
                        {renderActions?.(item)}
                        {canEdit && (
                            <Tooltip
                                label={isFeatured ? t('SITE.BUILDER.UNPIN') : t('SITE.BUILDER.PIN')}
                                withArrow
                            >
                                <ActionIcon
                                    variant={isFeatured ? 'filled' : 'light'}
                                    color="violet"
                                    size="sm"
                                    radius="md"
                                    loading={builder.updateSiteMutation.isPending}
                                    onClick={() => builder.toggleFeatured(type, item.id)}
                                    aria-label={isFeatured ? t('SITE.BUILDER.UNPIN') : t('SITE.BUILDER.PIN')}
                                >
                                    {isFeatured ? <IconPinnedOff size={24} /> : <IconPin size={24} />}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                </Group>
            </Box>
        );
    };

    return (
        <Stack gap="xl">
            <Card withBorder radius="sm" p="lg">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Box>
                        <Title order={3} c="violet">
                            {t('SITE.BUILDER.SECTION_VISIBLE', { section: t(`SITE.SECTIONS.${type}`) })}
                        </Title>
                        {description && (
                            <Text size="sm" c="dimmed" mt={4}>
                                {description}
                            </Text>
                        )}
                    </Box>
                    <Switch
                        size="md"
                        checked={section.enabled}
                        disabled={!canEdit}
                        onChange={(event) => builder.updateSection(type, { enabled: event.currentTarget.checked })}
                    />
                </Group>
            </Card>

            <Card withBorder radius="sm" p="lg">
                <Group justify="space-between" mb="md">
                    <Title order={4}>
                        {t('SITE.BUILDER.PINNED', { count: featured.length, max: MAX_FEATURED })}
                    </Title>
                </Group>
                {featured.length === 0 ? (
                    <Alert variant="light" color="violet" icon={<IconInfoCircle />} p="sm">
                        <Text size="sm">{fallbackHint ?? t('SITE.BUILDER.PINNED_EMPTY')}</Text>
                    </Alert>
                ) : (
                    <SortableList
                        items={featured}
                        getId={(item) => item.id}
                        disabled={!canEdit}
                        onReorder={(next) => builder.updateSection(type, { featuredIds: next.map((item) => item.id) })}
                        renderItem={(item, handle) => renderRow(item, handle)}
                    />
                )}
            </Card>

            <Card withBorder radius="sm" p="lg">
                <Group justify="space-between" mb="md" gap="sm">
                    <Title order={4}>
                        {t('SITE.BUILDER.ALL_ITEMS')}
                    </Title>
                    <Group gap="sm">
                        <TextInput
                            leftSection={<IconSearch />}
                            placeholder={t('SITE.BUILDER.SEARCH')}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                        />
                        {toolbar}
                    </Group>
                </Group>
                {filtered.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                        {items.length === 0 ? emptyText : t('SITE.BUILDER.SEARCH_EMPTY')}
                    </Text>
                ) : (
                    <Stack gap="sm">{filtered.map((item) => renderRow(item))}</Stack>
                )}
            </Card>
        </Stack>
    );
};

export default FeaturePicker;
