import APIHandler from "./APIHandler";
import { News } from "./News";
import { TenantProject } from "./TenantProject";

export type ProfileSectionType = "BOARD" | "EVENTS" | "SURVEYS" | "SUPPORT";

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
}

export interface PublicSiteBoardItem {
    _id: string;
    kind: "NEWS" | "PROJECT";
    title: string;
    content: string;
    image?: string;
    publishDate?: string;
    updatedAt: string;
}

export interface PublicSiteEvent {
    _id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
}

export interface PublicSiteSurvey {
    survey: { _id: string; title: string; description?: string };
    responses: number;
}

export interface PublicSiteSupportRequest {
    _id: string;
    title: string;
    description: string;
    publishDate?: string;
}

export interface PublicSitePage {
    _id: string;
    title: string;
    slug: string;
    content: string;
}

export interface PublicSite {
    tenant: { _id: string; title: string; description?: string };
    profile: Pick<
        Profile,
        | "description"
        | "contactPerson"
        | "contactEmail"
        | "contactPhone"
        | "contactWebsite"
        | "avatarImage"
        | "backgroundImage"
    >;
    site: {
        subdomain?: string;
        published: boolean;
        logoImage?: string;
        galleryImages: string[];
        sections: { type: ProfileSectionType; enabled: boolean }[];
        appearance?: { palette?: string; layout?: string };
        socialLinks?: { instagram?: string; other?: string };
    };
    pagesNav: { _id: string; title: string; slug: string }[];
    featured: {
        board: PublicSiteBoardItem[];
        events: PublicSiteEvent[];
        surveys: PublicSiteSurvey[];
        supportRequests: PublicSiteSupportRequest[];
        pages: PublicSitePage[];
    };
}

export const getSitePreview = async (tenantId?: string) => {
    if (!tenantId) throw new Error("No Tenant id provided");
    const response = await APIHandler.get(`/profile/tenant/${tenantId}/site/preview`);
    return response.data as PublicSite;
};

export interface ProfilePage {
    _id: string;
    title: string;
    slug: string;
    content: string;
    status: "DRAFT" | "EXAMINATION" | "PUBLISHED";
}

export const getProfilePages = async (tenantId?: string) => {
    if (!tenantId) throw new Error("No Tenant id provided");
    const response = await APIHandler.get(`/profile/tenant/${tenantId}/pages`);
    return response.data as ProfilePage[];
};

export const getProfile = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${tenantId}`);
    return response.data as {
        profile: Profile;
        news: News[];
        projects: TenantProject[];
    };
}

interface updateProfileRequest {
    tenantId?: string;
    body: {
        description?: string;
        contactPerson?: string;
        contactEmail?: string;
        contactPhone?: string;
        contactWebsite?: string;
        publicPerson?: string;
        avatarImage?: File | string | null;
    }
}

export const updateProfile = async (req: updateProfileRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const formData = new FormData();
    if (req.body.description !== undefined) formData.append('description', req.body.description);
    if (req.body.contactPerson !== undefined) formData.append('contactPerson', req.body.contactPerson);
    if (req.body.contactEmail !== undefined) formData.append('contactEmail', req.body.contactEmail);
    if (req.body.contactPhone !== undefined) formData.append('contactPhone', req.body.contactPhone);
    if (req.body.contactWebsite !== undefined) formData.append('contactWebsite', req.body.contactWebsite);
    if (req.body.publicPerson !== undefined) formData.append('publicPerson', req.body.publicPerson);
    if (req.body.avatarImage !== undefined) formData.append('avatarImage', req.body.avatarImage || '');
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as Profile;
}

interface updateProfileBackgroundRequest {
    tenantId?: string;
    body: {
        backgroundImage: File | string;
    }
}

export const updateProfileBackground = async (req: updateProfileBackgroundRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided.');
    const formData = new FormData();
    formData.append('backgroundImage', req.body.backgroundImage)
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/background`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as Profile;
}