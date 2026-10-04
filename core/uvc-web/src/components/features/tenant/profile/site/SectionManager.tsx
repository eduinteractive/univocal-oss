import { Badge, Box, Button, Card, Group, Switch, Text, ThemeIcon, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { ProfileSiteSection } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';
import { SECTION_ICONS, SECTION_TAB } from '../../../site/siteSections';
import SortableList from './SortableList';
import { SiteBuilder } from './useSiteBuilder';

interface SectionManagerProps {
    builder: SiteBuilder;
    onNavigate: (tab: string) => void;
}

const SectionManager = ({ builder, onNavigate }: SectionManagerProps) => {
    const { t } = useTranslation();
    const sections = builder.site?.sections ?? [];

    return (
        <Card withBorder radius="sm" p="lg">
            <Title order={4} mb={4}>
                {t('SITE.BUILDER.SECTIONS_TITLE')}
            </Title>
            <Text size="sm" c="dimmed" mb="md">
                {t('SITE.BUILDER.SECTIONS_HINT')}
            </Text>
            <SortableList
                items={sections}
                getId={(section) => section.type}
                disabled={!builder.canEdit}
                onReorder={(next: ProfileSiteSection[]) => builder.saveSections(next)}
                renderItem={(section, handle) => (
                    <Box
                        p="sm"
                        bg={section.enabled ? undefined : 'gray.0'}
                        style={{
                            borderRadius: 6,
                            border: '1px solid var(--mantine-color-gray-2)',
                        }}
                    >
                        <Group justify="space-between" wrap="nowrap" gap="xs">
                            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                                {handle}
                                <ThemeIcon size="md" variant="light" color="violet" radius="sm">
                                    {SECTION_ICONS[section.type]}
                                </ThemeIcon>
                                <Box style={{ minWidth: 0 }}>
                                    <Text size="sm" fw={600} truncate>
                                        {t(`SITE.SECTIONS.${section.type}`)}
                                    </Text>
                                    <Badge size="xs" variant="light" radius="sm" color={section.featuredIds.length ? 'violet' : 'gray'}>
                                        {t('SITE.BUILDER.PINNED_SHORT', { count: section.featuredIds.length })}
                                    </Badge>
                                </Box>
                            </Group>
                            <Group gap="sm" wrap="nowrap">
                                <Button
                                    size="compact-xs"
                                    variant="subtle"
                                    rightSection={<IconArrowRight size={12} />}
                                    onClick={() => onNavigate(SECTION_TAB[section.type])}
                                >
                                    {t('SITE.BUILDER.CHOOSE')}
                                </Button>
                                <Switch
                                    size="sm"
                                    checked={section.enabled}
                                    disabled={!builder.canEdit}
                                    onChange={(event) =>
                                        builder.updateSection(section.type, { enabled: event.currentTarget.checked })
                                    }
                                    aria-label={t('SITE.BUILDER.SECTION_VISIBLE', {
                                        section: t(`SITE.SECTIONS.${section.type}`),
                                    })}
                                />
                            </Group>
                        </Group>
                    </Box>
                )}
            />
        </Card>
    );
};

export default SectionManager;
