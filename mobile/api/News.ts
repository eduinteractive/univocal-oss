import { PROFILE_OBJECT_STATUS } from "../constants/Enums";
import APIHandler, { getUVCFilterParams, UVCFilterObject } from "./APIHandler";

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

interface getAllNewsRequest {
    tenantId: string;
    params: UVCFilterObject | null;
}

export const getAllNews = async (req: getAllNewsRequest) => {
    const response = await APIHandler.get(`/profile/tenant/${req.tenantId}/news`, { params: getUVCFilterParams(req.params) });
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