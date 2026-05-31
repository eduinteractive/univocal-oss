import APIHandler, { createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from "./APIHandler";

export interface WikiToc {
    title: string;
    sectionId?: string;
    children?: WikiToc[];
}

export interface Wiki extends UVCMetadata {
    _id: string;
    tableOfContents: WikiToc[];
}

export interface WikiSection {
    _id: string;
    title: string;
    content?: string;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[];
    wikiId: string;
}

interface getWikisRequest {
    tenantId: string;
    params: UVCFilterObject | null;
}

export const getWikis = async (req: getWikisRequest): Promise<Wiki[]> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/wiki`, {
        params: getUVCFilterParams(req.params)
    });
    return response.data;
}

export interface getWikiRequest {
    tenantId: string;
    wikiId: string;
}

export const getWiki = async (req: getWikiRequest): Promise<Wiki> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}`);
    return response.data;
}

interface createWikiRequest {
    tenantId: string;
    body: createUVCMetadataAttrs
}

export const createWiki = async (req: createWikiRequest): Promise<Wiki> => {
    const response = await APIHandler.post(`/knowledge/tenant/${req.tenantId}/wiki`, req.body);
    return response.data;
}

interface updateWikiRequest {
    tenantId: string;
    wikiId: string;
    body: updateUVCMetadataAttrs & {
        tableOfContents?: WikiToc[];
    }
}

export const updateWiki = async (req: updateWikiRequest): Promise<Wiki> => {
    const response = await APIHandler.put(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}`, req.body);
    return response.data;
}

interface deleteWikiRequest {
    tenantId: string;
    wikiId: string;
}

export const deleteWiki = async (req: deleteWikiRequest): Promise<void> => {
    const response = await APIHandler.delete(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}`);
    return response.data;
}

interface createWikiSectionRequest {
    tenantId: string;
    wikiId: string;
    body: {
        title: string;
        content?: string;
        parent?: string;
        index?: number;
        materials?: {
            title: string,
            link: string,
            mimetype: string
        }[];
        newUploads?: File[];
    }
}

export const createWikiSection = async (req: createWikiSectionRequest): Promise<WikiSection> => {
    const response = await APIHandler.post(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}/section`, req.body);
    return response.data;
}

interface getWikiSectionRequest {
    tenantId: string;
    wikiId: string;
    sectionId: string;
}

export const getWikiSection = async (req: getWikiSectionRequest): Promise<WikiSection> => {
    if (!req.sectionId) throw new Error("SectionId is required");
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}/section/${req.sectionId}`);
    return response.data;
}

interface updateWikiSectionRequest {
    tenantId: string;
    wikiId: string;
    sectionId: string;
    body: {
        title: string;
        content?: string;
        materials?: {
            title: string,
            link: string,
            mimetype: string
        }[];
        newUploads?: File[];
    }
}

export const updateWikiSection = async (req: updateWikiSectionRequest): Promise<WikiSection> => {
    const formData = new FormData();
    formData.append("title", req.body.title);
    if (req.body.content) formData.append("content", req.body.content);
    if (req.body.materials) {
        formData.append("materials", JSON.stringify(req.body.materials));
    }
    if (req.body.newUploads) {
        for (const file of req.body.newUploads) {
            formData.append("newUploads", file, file.name);
        }
    }
    const response = await APIHandler.put(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}/section/${req.sectionId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

interface deleteWikiSectionRequest {
    tenantId: string;
    wikiId: string;
    sectionId: string;
}

export const deleteWikiSection = async (req: deleteWikiSectionRequest): Promise<void> => {
    const response = await APIHandler.delete(`/knowledge/tenant/${req.tenantId}/wiki/${req.wikiId}/section/${req.sectionId}`);
    return response.data;
}



