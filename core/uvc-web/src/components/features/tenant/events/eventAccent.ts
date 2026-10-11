import { SITE_PALETTES, SitePalette } from '@eduinteractive/uvc-api';
import { SITE_PALETTE_TOKENS } from '../../site/siteTheme';

const LEGACY_PALETTE: Record<string, SitePalette> = {
    violet: 'univocal',
    blue: 'campus-navy',
    cyan: 'campus-navy',
    teal: 'forest',
    grape: 'rose',
    pink: 'rose',
    orange: 'amber',
};

export const selectedEventPalette = (accent?: string): SitePalette => {
    if (accent && (SITE_PALETTES as readonly string[]).includes(accent)) return accent as SitePalette;
    return LEGACY_PALETTE[accent ?? ''] ?? 'univocal';
};

export const eventAccentColor = (accent?: string) =>
    SITE_PALETTE_TOKENS[selectedEventPalette(accent)].primary;
