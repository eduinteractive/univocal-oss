import { CSSProperties, createContext, ReactNode, useContext, useMemo } from 'react';
import { ProfileSiteAppearance } from '@eduinteractive/uvc-api';
import { DEFAULT_APPEARANCE, LayoutTokens, resolveAppearance, SITE_LAYOUT_TOKENS, themeVars } from './siteTheme';

interface SiteThemeValue extends ProfileSiteAppearance {
    layoutTokens: LayoutTokens;
    /** Apply on portal roots (modals, drawers) so they inherit the palette. */
    vars: CSSProperties;
}

const SiteThemeContext = createContext<SiteThemeValue>({
    ...DEFAULT_APPEARANCE,
    layoutTokens: SITE_LAYOUT_TOKENS[DEFAULT_APPEARANCE.layout],
    vars: themeVars(DEFAULT_APPEARANCE.palette, DEFAULT_APPEARANCE.layout),
});

export const SiteThemeProvider = ({
    appearance,
    children,
}: {
    appearance?: Partial<ProfileSiteAppearance>;
    children: ReactNode;
}) => {
    const { palette, layout } = resolveAppearance(appearance);
    const value = useMemo<SiteThemeValue>(
        () => ({
            palette,
            layout,
            layoutTokens: SITE_LAYOUT_TOKENS[layout],
            vars: themeVars(palette, layout),
        }),
        [palette, layout],
    );
    return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteTheme = () => useContext(SiteThemeContext);
