import { APIHandler } from '@eduinteractive/uvc-api';

export const PROFILE_BASE_DOMAIN = (
    import.meta.env.VITE_PROFILE_BASE_DOMAIN || 'univocal.de'
).toLowerCase();

const NON_PROFILE_SUBDOMAINS = new Set(['www', 'apps', 'api', 'monitoring']);

/**
 * Returns the group subdomain when the app is served from
 * `{subdomain}.{PROFILE_BASE_DOMAIN}`, otherwise undefined.
 */
export const getSiteSubdomainFromHost = (
    hostname: string = window.location.hostname
): string | undefined => {
    const host = hostname.toLowerCase();
    const suffix = `.${PROFILE_BASE_DOMAIN}`;
    if (!host.endsWith(suffix)) return undefined;
    const label = host.slice(0, -suffix.length);
    if (!label || label.includes('.') || NON_PROFILE_SUBDOMAINS.has(label)) {
        return undefined;
    }
    return label;
};

export const isSiteHost = () => getSiteSubdomainFromHost() !== undefined;

/** Origin that serves the APIs for the current host. */
export const getApiOrigin = () =>
    isSiteHost() ? window.location.origin : import.meta.env.VITE_KUBERNETES_HOST;

/** On a group subdomain the public APIs are proxied same-origin by the ingress. */
export const configureApiForSiteHost = () => {
    if (isSiteHost()) {
        APIHandler.defaults.baseURL = `${window.location.origin}/api`;
        APIHandler.defaults.withCredentials = true;
    }
};

export const buildSiteUrl = (subdomain: string) => {
    const protocol =
        typeof window !== 'undefined' ? window.location.protocol : 'https:';
    return `${protocol}//${subdomain}.${PROFILE_BASE_DOMAIN}`;
};

/** Fallback URL that works without wildcard DNS (served from the app host). */
export const buildSitePathUrl = (subdomain: string) =>
    `${import.meta.env.VITE_KUBERNETES_HOST}/g/${subdomain}`;

export const profileImageUrl = (key?: string) =>
    key
        ? `${getApiOrigin()}/api/profile/image/${encodeURIComponent(key)}`
        : undefined;
