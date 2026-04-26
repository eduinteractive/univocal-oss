import { APIHandler, getSVHFilterParams, SVHFilterObject } from "../base";
import { News, Profile, PROFILE_OBJECT_STATUS, TenantProject } from "./Types";

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
    formData.append('avatarImage', req.body.avatarImage || '');
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