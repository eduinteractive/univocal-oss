import { APIHandler, getSVHFilterParams, SVHFilterObject } from "../base";
import {
    News,
    Profile,
    PROFILE_OBJECT_STATUS,
    ProfilePage,
    ProfileSite,
    ProfileSiteAppearance,
    ProfileSiteLegal,
    ProfileSiteSection,
    ProfileSiteSocialLinks,
    ProfileSupportRequest,
    ProfileSupportResponse,
    PublicSite,
    SubdomainCheck,
    SUPPORT_REQUEST_STATUS,
    SUPPORT_RESPONSE_STATUS,
    TenantProject,
} from "./Types";

/**
 * Site Routes
 */

export const getSite = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${tenantId}/site`);
    return response.data as ProfileSite;
}

export const getSitePreview = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${tenantId}/site/preview`);
    return response.data as PublicSite;
}

interface updateSiteRequest {
    tenantId?: string;
    body: {
        published?: boolean;
        seoTitle?: string;
        seoDescription?: string;
        galleryImages?: string[];
        logoImage?: string;
        sections?: ProfileSiteSection[];
        appearance?: ProfileSiteAppearance;
        socialLinks?: ProfileSiteSocialLinks;
        legal?: ProfileSiteLegal;
    };
}

export const updateSite = async (req: updateSiteRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/site`, req.body);
    return response.data as ProfileSite;
}

interface checkSubdomainRequest {
    tenantId?: string;
    subdomain: string;
}

export const checkSubdomain = async (req: checkSubdomainRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/site/subdomain/check`, { params: { subdomain: req.subdomain } });
    return response.data as SubdomainCheck;
}

interface updateSubdomainRequest {
    tenantId?: string;
    subdomain: string | null;
}

export const updateSubdomain = async (req: updateSubdomainRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/site/subdomain`, { subdomain: req.subdomain });
    return response.data as ProfileSite;
}

interface updateSiteLogoRequest {
    tenantId?: string;
    logoImage: File;
}

export const updateSiteLogo = async (req: updateSiteLogoRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const formData = new FormData();
    formData.append('logoImage', req.logoImage);
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/site/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data as ProfileSite;
}

interface addSiteGalleryImagesRequest {
    tenantId?: string;
    images: File[];
}

export const addSiteGalleryImages = async (req: addSiteGalleryImagesRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const formData = new FormData();
    req.images.forEach((image) => formData.append('images', image));
    const response = await APIHandler.post(`/profile/tenant/${req.tenantId}/site/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data as ProfileSite;
}

/**
 * Info Page Routes
 */

export const getPages = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${tenantId}/pages`);
    return response.data as ProfilePage[];
}

interface createPageRequest {
    tenantId?: string;
    body: {
        title: string;
        slug?: string;
        content?: string;
        status?: PROFILE_OBJECT_STATUS;
    };
}

export const createPage = async (req: createPageRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.post(`/profile/tenant/${req.tenantId}/pages`, req.body);
    return response.data as ProfilePage;
}

interface updatePageRequest {
    tenantId?: string;
    pageId: string;
    body: {
        title?: string;
        slug?: string;
        content?: string;
        status?: PROFILE_OBJECT_STATUS;
    };
}

export const updatePage = async (req: updatePageRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/pages/${req.pageId}`, req.body);
    return response.data as ProfilePage;
}

interface deletePageRequest {
    tenantId?: string;
    pageId: string;
}

export const deletePage = async (req: deletePageRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.delete(`/profile/tenant/${req.tenantId}/pages/${req.pageId}`);
    return response.data;
}

/**
 * Support Request Routes
 */

export const getSupportRequests = async (tenantId?: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${tenantId}/support-requests`);
    return response.data as ProfileSupportRequest[];
}

interface createSupportRequestRequest {
    tenantId?: string;
    body: {
        title: string;
        description?: string;
        status?: SUPPORT_REQUEST_STATUS;
    };
}

export const createSupportRequest = async (req: createSupportRequestRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.post(`/profile/tenant/${req.tenantId}/support-requests`, req.body);
    return response.data as ProfileSupportRequest;
}

interface updateSupportRequestRequest {
    tenantId?: string;
    requestId: string;
    body: {
        title?: string;
        description?: string;
        status?: SUPPORT_REQUEST_STATUS;
    };
}

export const updateSupportRequest = async (req: updateSupportRequestRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/support-requests/${req.requestId}`, req.body);
    return response.data as ProfileSupportRequest;
}

interface deleteSupportRequestRequest {
    tenantId?: string;
    requestId: string;
}

export const deleteSupportRequest = async (req: deleteSupportRequestRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.delete(`/profile/tenant/${req.tenantId}/support-requests/${req.requestId}`);
    return response.data;
}

interface getSupportResponsesRequest {
    tenantId?: string;
    requestId?: string;
    status?: SUPPORT_RESPONSE_STATUS;
}

export const getSupportResponses = async (req: getSupportResponsesRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/support-responses`, {
        params: { requestId: req.requestId, status: req.status }
    });
    return response.data as ProfileSupportResponse[];
}

interface updateSupportResponseRequest {
    tenantId?: string;
    responseId: string;
    status: SUPPORT_RESPONSE_STATUS;
}

export const updateSupportResponse = async (req: updateSupportResponseRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/support-responses/${req.responseId}`, { status: req.status });
    return response.data as ProfileSupportResponse;
}

interface deleteSupportResponseRequest {
    tenantId?: string;
    responseId: string;
}

export const deleteSupportResponse = async (req: deleteSupportResponseRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.delete(`/profile/tenant/${req.tenantId}/support-responses/${req.responseId}`);
    return response.data;
}

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
    if (req.body.avatarImage) formData.append('avatarImage', req.body.avatarImage);
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

/**
 * News Routes
 */


interface getAllNewsRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getAllNews = async (req: getAllNewsRequest) => {
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/news`, { params: getSVHFilterParams(req.params) });
    return response.data as News[];
}

interface getNewsRequest {
    newsId: string;
    tenantId: string;
}

export const getNews = async (req: getNewsRequest) => {
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/news/${req.newsId}`);
    return response.data as News;
}

interface createNewsRequest {
    tenantId?: string;
    body: {
        title: string;
        content: string;
        image?: File | string;
        status?: PROFILE_OBJECT_STATUS;
    }
}

export const createNews = async (req: createNewsRequest) => {
    if (!req.tenantId) throw new Error("Tenant ID is required");
    const formData = new FormData();
    formData.append("title", req.body.title);
    formData.append("content", req.body.content);
    if (req.body.status !== undefined) formData.append("status", req.body.status);
    if (req.body.image) {
        formData.append("image", req.body.image);
    }
    const response = await APIHandler.post(`/profile/tenant/${req.tenantId}/news`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data as News;
}

interface updateNewsRequest {
    tenantId?: string;
    newsId: string;
    body: {
        title?: string;
        content?: string;
        image?: File | string;
        status?: PROFILE_OBJECT_STATUS;
    }
}

export const updateNews = async (req: updateNewsRequest) => {
    if (!req.tenantId) throw new Error("Tenant ID is required");
    const formData = new FormData();
    if (req.body.title) formData.append("title", req.body.title);
    if (req.body.content) formData.append("content", req.body.content);
    if (req.body.image) formData.append("image", req.body.image);
    if (req.body.status !== undefined) formData.append("status", req.body.status);
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/news/${req.newsId}`,formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data as News;
}

interface deleteNewsRequest {
    tenantId: string;
    newsId: string;
}

export const deleteNews = async (req: deleteNewsRequest) => {
    const response = await APIHandler.delete(`/profile/tenant/${req.tenantId}/news/${req.newsId}`);
    return response.data as News;
}

/**
 * Project Routes
 */

interface getTenantProjectsQuery {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getTenantProjects = async (req: getTenantProjectsQuery) => {
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/project`, { params: getSVHFilterParams(req.params) });
    return response.data as TenantProject[];
}

interface getTenantProjectRequest {
    projectId: string;
    tenantId: string;
}

export const getTenantProject = async (req: getTenantProjectRequest) => {
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/project/${req.projectId}`);
    return response.data as TenantProject;
}

interface createTenantProjectRequest {
    tenantId?: string;
    body: {
        title: string;
        content: string;
        image?: File | string;
        status?: PROFILE_OBJECT_STATUS;
    }
}

export const createTenantProject = async (req: createTenantProjectRequest) => {
    if (!req.tenantId) throw new Error("Tenant ID is required");
    const formData = new FormData();
    formData.append("title", req.body.title);
    formData.append("content", req.body.content);
    if (req.body.status !== undefined) formData.append("status", req.body.status);
    if (req.body.image) {
        formData.append("image", req.body.image);
    }
    const response = await APIHandler.post(`/profile/tenant/${req.tenantId}/project`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data as TenantProject;
}

interface updateTenantProjectRequest {
    tenantId?: string;
    projectId: string;
    body: {
        title?: string;
        content?: string;
        image?: File | string;
        status?: PROFILE_OBJECT_STATUS;
    }
}

export const updateTenantProject = async (req: updateTenantProjectRequest) => {
    if (!req.tenantId) throw new Error("Tenant ID is required");
    const formData = new FormData();
    if (req.body.title) formData.append("title", req.body.title);
    if (req.body.content) formData.append("content", req.body.content);
    if (req.body.image) formData.append("image", req.body.image);
    if (req.body.status !== undefined) formData.append("status", req.body.status);
    const response = await APIHandler.put(`/profile/tenant/${req.tenantId}/project/${req.projectId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data as TenantProject;
}

interface deleteTenantProjectRequest {
    tenantId: string;
    projectId: string;
}

export const deleteTenantProject = async (req: deleteTenantProjectRequest) => {
    const response = await APIHandler.delete(`/profile/tenant/${req.tenantId}/project/${req.projectId}`);
    return response.data as TenantProject;
}