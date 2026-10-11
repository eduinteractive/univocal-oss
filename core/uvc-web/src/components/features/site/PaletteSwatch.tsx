import { Box, Group, Text, UnstyledButton } from '@mantine/core';
import { SitePalette } from '@eduinteractive/uvc-api';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SITE_PALETTE_TOKENS } from './siteTheme';

interface PaletteSwatchProps {
    palette: SitePalette;
    selected: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

const PaletteSwatch = ({ palette, selected, disabled, onSelect }: PaletteSwatchProps) => {
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

export default PaletteSwatch;
