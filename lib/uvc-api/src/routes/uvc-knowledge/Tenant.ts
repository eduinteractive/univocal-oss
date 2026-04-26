import { APIHandler, createSVHMetadataAttrs, getSVHFilterParams, SVHFilterObject, updateSVHMetadataAttrs } from "../base";
import { Contact, ContactGroup, Wiki, WikiSection, WikiToc } from "./Types";

/**
 * Contact Routes
 */

interface getContacGroupsRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getContactGroups = async (req: getContacGroupsRequest): Promise<ContactGroup[]> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/contactgroup`, {
        params: getSVHFilterParams(req.params)
    });
    return response.data;
}

interface createContactGroupRequest {
    tenantId: string;
    body: createSVHMetadataAttrs
}

export const createContactGroup = async (req: createContactGroupRequest): Promise<ContactGroup> => {
    return await APIHandler.post(`/knowledge/tenant/${req.tenantId}/contactgroup`, req.body);
}

interface getContactGroupRequest {
    tenantId: string;
    contactGroupId: string;
    params: SVHFilterObject | null;
}

export const getContactGroup = async (req: getContactGroupRequest): Promise<{contactGroup: ContactGroup, contacts: Contact[]}> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/contactgroup/${req.contactGroupId}`, {
        params: getSVHFilterParams(req.params)
    });
    return response.data;
}

interface updateContactGroupRequest {
    tenantId: string;
    contactGroupId: string;
    body: updateSVHMetadataAttrs
}

export const updateContactGroup = async (req: updateContactGroupRequest): Promise<ContactGroup> => {
    return await APIHandler.put(`/knowledge/tenant/${req.tenantId}/contactgroup/${req.contactGroupId}`, req.body);
}

interface deleteContactGroupRequest {
    tenantId: string;
    contactGroupId: string;
}

export const deleteContactGroup = async (req: deleteContactGroupRequest): Promise<void> => {
    return await APIHandler.delete(`/knowledge/tenant/${req.tenantId}/contactgroup/${req.contactGroupId}`);
}

interface createContactRequest {
    tenantId: string;
    body: {
        contactGroupIds: string[];
        title?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        description?: string;
        street?: string;
        zip?: string;
        city?: string;
    }
}

export const createContact = async (req: createContactRequest): Promise<Contact> => {
    return await APIHandler.post(`/knowledge/tenant/${req.tenantId}/contact`, req.body);
}

interface createMultipleContactsRequest {
    tenantId: string;
    body: {
        contacts: {
            contactGroupIds: string[];
            title?: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
            description?: string;
            street?: string;
            zip?: string;
            city?: string;
        }[]
    }
}

export const createMultipleContacts = async (req: createMultipleContactsRequest): Promise<Contact[]> => {
    return await APIHandler.post(`/knowledge/tenant/${req.tenantId}/contact/bulk`, req.body);
}

interface updateContactRequest {
    tenantId: string;
    contactId: string;
    body: {
        contactGroupIds?: string[];
        title?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        description?: string;
        street?: string;
        zip?: string;
        city?: string;
    }
}

export const updateContact = async (req: updateContactRequest): Promise<Contact> => {
    return await APIHandler.put(`/knowledge/tenant/${req.tenantId}/contact/${req.contactId}`, req.body);
}

interface deleteContactRequest {
    tenantId: string;
    contactId: string;
}

export const deleteContact = async (req: deleteContactRequest): Promise<void> => {
    return await APIHandler.delete(`/knowledge/tenant/${req.tenantId}/contact/${req.contactId}`);
}


/**
 * Wiki Routes
 */


interface getWikisRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getWikis = async (req: getWikisRequest): Promise<Wiki[]> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/wiki`, {
        params: getSVHFilterParams(req.params)
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
    body: createSVHMetadataAttrs
}

export const createWiki = async (req: createWikiRequest): Promise<Wiki> => {
    const response = await APIHandler.post(`/knowledge/tenant/${req.tenantId}/wiki`, req.body);
    return response.data;
}

interface updateWikiRequest {
    tenantId: string;
    wikiId: string;
    body: updateSVHMetadataAttrs & {
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



