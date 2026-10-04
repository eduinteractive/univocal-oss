import { createContext, ReactNode, useContext } from 'react';

interface SiteContextType {
    subdomain?: string;
    /** Router prefix of the site: '' on a group subdomain, '/g/:subdomain' on the app host. */
    basePath: string;
    /** Rendered inside the builder: links and interactions are inert. */
    preview: boolean;
    /** Forces the stacked mobile layout regardless of viewport (builder phone frame). */
    mobile?: boolean;
}

const SiteContext = createContext<SiteContextType>({ basePath: '', preview: false });

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({
    children,
    ...value
}: SiteContextType & { children: ReactNode }) => (
    <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
);
