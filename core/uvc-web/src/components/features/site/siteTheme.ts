import { CSSProperties } from 'react';
import {
    ProfileSiteAppearance,
    SITE_LAYOUTS,
    SITE_PALETTES,
    SiteLayoutPreset,
    SitePalette,
} from '@eduinteractive/uvc-api';

interface PaletteTokens {
    /** Buttons, headings, badges, compact highlight cards. */
    primary: string;
    /** Second hero gradient stop. */
    accent: string;
    /** Tinted card surface. */
    soft: string;
    softBorder: string;
    /** Secondary text on primary or footer backgrounds. */
    onPrimaryMuted: string;
    page: string;
    footer: string;
    footerDivider: string;
}

export const SITE_PALETTE_TOKENS: Record<SitePalette, PaletteTokens> = {
    univocal: {
        primary: '#120875',
        accent: '#f93a88',
        soft: '#eeecff',
        softBorder: '#d9d5fb',
        onPrimaryMuted: '#d9d5fb',
        page: '#f8f9fa',
        footer: '#120875',
        footerDivider: '#3a2cb8',
    },
    'campus-navy': {
        primary: '#0f2a4a',
        accent: '#4a78a8',
        soft: '#eef3f9',
        softBorder: '#dbe5f1',
        onPrimaryMuted: '#bccde2',
        page: '#f6f8fa',
        footer: '#0f2a4a',
        footerDivider: '#1f4470',
    },
    forest: {
        primary: '#1f4d3a',
        accent: '#6a9a78',
        soft: '#eef5f1',
        softBorder: '#d6e7dd',
        onPrimaryMuted: '#c0d9ca',
        page: '#f6f8f6',
        footer: '#1a3f30',
        footerDivider: '#2c5e48',
    },
    rose: {
        primary: '#8a1f45',
        accent: '#cf7a98',
        soft: '#fbf0f4',
        softBorder: '#f3d9e3',
        onPrimaryMuted: '#f2c9d8',
        page: '#faf7f8',
        footer: '#6e1837',
        footerDivider: '#922650',
    },
    amber: {
        primary: '#87470a',
        accent: '#d9a04e',
        soft: '#fdf5ea',
        softBorder: '#f6e3c6',
        onPrimaryMuted: '#f3d7ab',
        page: '#faf8f5',
        footer: '#5c3205',
        footerDivider: '#7a4408',
    },
    slate: {
        primary: '#1f2937',
        accent: '#71819a',
        soft: '#f1f3f5',
        softBorder: '#e2e6ea',
        onPrimaryMuted: '#cbd2da',
        page: '#f7f8f9',
        footer: '#111827',
        footerDivider: '#374151',
    },
};

export type HeroStyle = 'overlap' | 'overlay' | 'split';
export type SectionChrome = 'elevated' | 'ruled' | 'cards';
export type GalleryStyle = 'card' | 'bleed' | 'mosaic';

export interface LayoutTokens {
    bannerHeight: { base: number; sm: number };
    cardOverlap: { base: number; sm: number };
    sectionGap: number;
    cardPadding: 'md' | 'lg' | 'xl';
    /** Board items visible before "show more". */
    feedLimit: number;
    heroStyle: HeroStyle;
    sectionChrome: SectionChrome;
    galleryStyle: GalleryStyle;
    radius: 'md' | 'lg' | 'xl';
}

export const SITE_LAYOUT_TOKENS: Record<SiteLayoutPreset, LayoutTokens> = {
    magazine: {
        bannerHeight: { base: 280, sm: 420 },
        cardOverlap: { base: 0, sm: 0 },
        sectionGap: 56,
        cardPadding: 'xl',
        feedLimit: 6,
        heroStyle: 'overlay',
        sectionChrome: 'ruled',
        galleryStyle: 'bleed',
        radius: 'md',
    },
    showcase: {
        bannerHeight: { base: 220, sm: 360 },
        cardOverlap: { base: 0, sm: 0 },
        sectionGap: 40,
        cardPadding: 'lg',
        feedLimit: 6,
        heroStyle: 'split',
        sectionChrome: 'cards',
        galleryStyle: 'mosaic',
        radius: 'xl',
    },
    compact: {
        bannerHeight: { base: 96, sm: 150 },
        cardOverlap: { base: -36, sm: -52 },
        sectionGap: 32,
        cardPadding: 'lg',
        feedLimit: 5,
        heroStyle: 'overlap',
        sectionChrome: 'elevated',
        galleryStyle: 'card',
        radius: 'lg',
    },
};

/** Legacy presets from before the Magazin / Bühne redesign. */
const LEGACY_LAYOUTS: Record<string, SiteLayoutPreset> = {
    classic: 'magazine',
    feed: 'showcase',
};

export const DEFAULT_APPEARANCE: ProfileSiteAppearance = { palette: 'univocal', layout: 'compact' };

export const resolveLayout = (layout?: string): SiteLayoutPreset => {
    if (layout && SITE_LAYOUTS.includes(layout as SiteLayoutPreset)) return layout as SiteLayoutPreset;
    if (layout && LEGACY_LAYOUTS[layout]) return LEGACY_LAYOUTS[layout];
    return DEFAULT_APPEARANCE.layout;
};

export const resolveAppearance = (appearance?: Partial<ProfileSiteAppearance>): ProfileSiteAppearance => ({
    palette: SITE_PALETTES.includes(appearance?.palette as SitePalette)
        ? (appearance!.palette as SitePalette)
        : DEFAULT_APPEARANCE.palette,
    layout: resolveLayout(appearance?.layout),
});

export const themeVars = (palette: SitePalette, layout: SiteLayoutPreset): CSSProperties => {
    const tokens = SITE_PALETTE_TOKENS[palette];
    const layoutTokens = SITE_LAYOUT_TOKENS[layout];
    return {
        '--site-card-padding': `var(--mantine-spacing-${layoutTokens.cardPadding})`,
        '--site-radius': `var(--mantine-radius-${layoutTokens.radius})`,
        '--site-primary': tokens.primary,
        '--site-accent': tokens.accent,
        '--site-soft': tokens.soft,
        '--site-soft-border': tokens.softBorder,
        '--site-on-primary-muted': tokens.onPrimaryMuted,
        '--site-page': tokens.page,
        '--site-footer': tokens.footer,
        '--site-footer-divider': tokens.footerDivider,
        '--site-hero-gradient': `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
    } as CSSProperties;
};
