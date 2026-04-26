import { SVHFilterObject } from "../components/common/SVHFilter";
import { PROFILE_OBJECT_STATUS } from "../constants/Enums";
import APIHandler, { getSVHFilterParams } from "./APIHandler";

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