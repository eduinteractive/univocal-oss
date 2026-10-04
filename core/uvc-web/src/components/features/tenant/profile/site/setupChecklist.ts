import { PROFILE_SECTION_TYPE, Profile, ProfileSite, ProfileSiteLegalNotice, PublicSite } from '@eduinteractive/uvc-api';
import { legalHtmlIsEmpty } from '../../../site/legalHtml';

export type SetupAction = 'logo' | 'description' | 'gallery' | 'contacts' | 'tab';

export interface SetupStep {
    key: string;
    done: boolean;
    optional?: boolean;
    action: SetupAction;
    tab?: string;
}

const featuredCount = (site: ProfileSite | undefined, type: PROFILE_SECTION_TYPE) =>
    site?.sections.find((section) => section.type === type)?.featuredIds.length ?? 0;

const noticeReady = (notice?: ProfileSiteLegalNotice) => {
    if (!notice) return false;
    if (notice.mode === 'link') return !!notice.url?.trim();
    return !legalHtmlIsEmpty(notice.text);
};

export const buildSetupSteps = (
    site: ProfileSite | undefined,
    profile: Profile | undefined,
    preview: PublicSite | undefined
): SetupStep[] => [
    { key: 'LOGO', done: !!(site?.logoImage || profile?.avatarImage), action: 'logo' },
    { key: 'DESCRIPTION', done: !!profile?.description?.replace(/<[^>]*>/g, '').trim(), action: 'description' },
    { key: 'GALLERY', done: (site?.galleryImages.length ?? 0) > 0, action: 'gallery' },
    { key: 'CONTACTS', done: !!(profile?.contactEmail || profile?.contactPhone), action: 'contacts' },
    { key: 'EVENT', done: featuredCount(site, PROFILE_SECTION_TYPE.EVENTS) > 0, action: 'tab', tab: 'events' },
    {
        key: 'SURVEY',
        done: featuredCount(site, PROFILE_SECTION_TYPE.SURVEYS) > 0,
        optional: true,
        action: 'tab',
        tab: 'surveys',
    },
    {
        key: 'INFO',
        done: (preview?.pagesNav.length ?? 0) > 0,
        optional: true,
        action: 'tab',
        tab: 'infos',
    },
    {
        key: 'SUPPORT',
        done: (preview?.featured.supportRequests.length ?? 0) > 0,
        optional: true,
        action: 'tab',
        tab: 'support',
    },
    { key: 'SUBDOMAIN', done: !!site?.subdomain, action: 'tab', tab: 'settings' },
    {
        key: 'LEGAL',
        done: noticeReady(site?.legal?.imprint) && noticeReady(site?.legal?.privacy),
        action: 'tab',
        tab: 'settings#site-legal',
    },
    { key: 'PUBLISH', done: !!site?.published, action: 'tab', tab: 'settings' },
];

export const setupProgress = (steps: SetupStep[]) => {
    const required = steps.filter((step) => !step.optional);
    const done = required.filter((step) => step.done).length;
    return { done, total: required.length, percent: Math.round((done / required.length) * 100) };
};
