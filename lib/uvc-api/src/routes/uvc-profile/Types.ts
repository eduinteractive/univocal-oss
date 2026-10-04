export interface Profile {
    tenantId?: string;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
    backgroundImage?: string;
    site?: ProfileSite;
}

export enum PROFILE_SECTION_TYPE {
    BOARD = "BOARD",
    EVENTS = "EVENTS",
    SURVEYS = "SURVEYS",
    SUPPORT = "SUPPORT"
}

export type PublicSiteBoardKind = "NEWS" | "PROJECT";

export interface PublicSiteBoardItem {
    _id: string;
    kind: PublicSiteBoardKind;
    title: string;
    content: string;
    image?: string;
    publishDate?: Date;
    updatedAt: Date;
}

export interface ProfileSiteSection {
    type: PROFILE_SECTION_TYPE;
    enabled: boolean;
    featuredIds: string[];
}

export const SITE_PALETTES = ["univocal", "campus-navy", "forest", "rose", "amber", "slate"] as const;
export type SitePalette = (typeof SITE_PALETTES)[number];

export const SITE_LAYOUTS = ["compact", "magazine", "showcase"] as const;
export type SiteLayoutPreset = (typeof SITE_LAYOUTS)[number];

export interface ProfileSiteAppearance {
    palette: SitePalette;
    layout: SiteLayoutPreset;
}

export interface ProfileSiteSocialLinks {
    instagram?: string;
    other?: string;
}

export const SITE_LEGAL_MODES = ["text", "link"] as const;
export type SiteLegalMode = (typeof SITE_LEGAL_MODES)[number];

export interface ProfileSiteLegalNotice {
    mode: SiteLegalMode;
    text?: string;
    url?: string;
}

export interface ProfileSiteLegal {
    privacy?: ProfileSiteLegalNotice;
    imprint?: ProfileSiteLegalNotice;
}

export interface ProfileSite {
    subdomain?: string;
    published: boolean;
    logoImage?: string;
    galleryImages: string[];
    sections: ProfileSiteSection[];
    seoTitle?: string;
    seoDescription?: string;
    appearance?: ProfileSiteAppearance;
    socialLinks?: ProfileSiteSocialLinks;
    legal?: ProfileSiteLegal;
}

export type SubdomainUnavailableReason = "FORMAT" | "RESERVED" | "TAKEN";

export interface SubdomainCheck {
    subdomain: string;
    available: boolean;
    reason?: SubdomainUnavailableReason;
}

export interface ProfilePage {
    _id: string;
    tenantId: string;
    authorId: string;
    title: string;
    slug: string;
    content: string;
    status: PROFILE_OBJECT_STATUS;
    publishDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum SUPPORT_REQUEST_STATUS {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    CLOSED = "CLOSED"
}

export interface ProfileSupportRequest {
    _id: string;
    tenantId: string;
    authorId: string;
    title: string;
    description: string;
    status: SUPPORT_REQUEST_STATUS;
    publishDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    responseCount?: number;
    openResponseCount?: number;
}

export enum SUPPORT_RESPONSE_KIND {
    OFFER = "OFFER",
    QUESTION = "QUESTION"
}

export enum SUPPORT_RESPONSE_STATUS {
    OPEN = "OPEN",
    DONE = "DONE"
}

export interface ProfileSupportResponse {
    _id: string;
    tenantId: string;
    requestId: string;
    kind: SUPPORT_RESPONSE_KIND;
    name?: string;
    email?: string;
    message: string;
    status: SUPPORT_RESPONSE_STATUS;
    createdAt: Date;
    updatedAt: Date;
}

export interface PublicSiteEvent {
    _id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    registrationEnabled: boolean;
    programEnabled: boolean;
}

export interface PublicSiteSurveyComponent {
    _id: string;
    surveyId: string;
    title: string;
    type: string;
    required?: boolean;
    next?: string;
    previous?: string;
    choices?: string[];
    multiple?: boolean;
    max?: number;
    scale?: { labels: string[] };
    nominalType?: string;
    description?: string;
}

export interface PublicSiteSurvey {
    survey: {
        _id: string;
        title: string;
        description?: string;
        options: {
            executionMode: string;
            isActive: boolean;
        };
    };
    components: PublicSiteSurveyComponent[];
    responses: number;
}

export interface PublicSitePage {
    _id: string;
    title: string;
    slug: string;
    content: string;
    publishDate?: Date;
    updatedAt: Date;
}

export interface PublicSite {
    tenant: {
        _id: string;
        title: string;
        description?: string;
    };
    profile: Pick<Profile, "description" | "contactPerson" | "contactEmail" | "contactPhone" | "contactWebsite" | "avatarImage" | "backgroundImage">;
    site: {
        subdomain?: string;
        published: boolean;
        logoImage?: string;
        galleryImages: string[];
        sections: { type: PROFILE_SECTION_TYPE; enabled: boolean }[];
        seoTitle?: string;
        seoDescription?: string;
        appearance?: ProfileSiteAppearance;
        socialLinks?: ProfileSiteSocialLinks;
        legal?: ProfileSiteLegal;
    };
    pagesNav: { _id: string; title: string; slug: string }[];
    featured: {
        board: PublicSiteBoardItem[];
        events: PublicSiteEvent[];
        surveys: PublicSiteSurvey[];
        supportRequests: ProfileSupportRequest[];
        pages: PublicSitePage[];
    };
}

export interface PublicSurveyResults {
    surveyId: string;
    total: number;
    components: {
        componentId: string;
        type: string;
        counts: Record<string, number>;
    }[];
}

export enum PROFILE_OBJECT_STATUS {
    DRAFT = "DRAFT",
    EXAMINATION = "EXAMINATION",
    PUBLISHED = "PUBLISHED"
}

export interface TenantProject {
    _id?: string;
    tenantId: string;
    authorId: string;
    title: string;
    content: string;
    image?: string;
    status: PROFILE_OBJECT_STATUS;
    createdAt: Date;
    updatedAt: Date;
    publishDate?: Date;
}

export interface News {
    _id?: string;
    tenantId: string;
    authorId: string;
    title: string;
    content: string;
    image?: string;
    status: PROFILE_OBJECT_STATUS;
    createdAt: Date;
    updatedAt: Date;
    publishDate?: Date;
}