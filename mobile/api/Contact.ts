import APIHandler, { createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from "./APIHandler";

export interface ContactGroup extends UVCMetadata{
    _id: string;
}

export interface Contact {
    _id: string;
    contactGroupIds: string[];
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    description?: string;
}

interface getContacGroupsRequest {
    tenantId: string;
    params: UVCFilterObject | null;
}

export const getContactGroups = async (req: getContacGroupsRequest): Promise<ContactGroup[]> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/contactgroup`, {
        params: getUVCFilterParams(req.params)
    });
    return response.data;
}

interface createContactGroupRequest {
    tenantId: string;
    body: createUVCMetadataAttrs
}

export const createContactGroup = async (req: createContactGroupRequest): Promise<ContactGroup> => {
    const response = await APIHandler.post(`/knowledge/tenant/${req.tenantId}/contactgroup`, req.body);
    return response.data as ContactGroup;
}

interface getContactGroupRequest {
    tenantId: string;
    contactGroupId: string;
    params: UVCFilterObject | null;
}

export const getContactGroup = async (req: getContactGroupRequest): Promise<{contactGroup: ContactGroup, contacts: Contact[]}> => {
    const response = await APIHandler.get(`/knowledge/tenant/${req.tenantId}/contactgroup/${req.contactGroupId}`, {
        params: getUVCFilterParams(req.params)
    });
    return response.data;
}

interface updateContactGroupRequest {
    tenantId: string;
    contactGroupId: string;
    body: updateUVCMetadataAttrs
}

export const updateContactGroup = async (req: updateContactGroupRequest): Promise<ContactGroup> => {
    const response = await APIHandler.put(`/knowledge/tenant/${req.tenantId}/contactgroup/${req.contactGroupId}`, req.body);
    return response.data as ContactGroup;
}

interface deleteContactGroupRequest {
    tenantId: string;
    contactGroupId: string;
}

export const deleteContactGroup = async (req: deleteContactGroupRequest): Promise<void> => {
    const response = await APIHandler.delete(`/knowledge/tenant/${req.tenantId}/contactgroup/${req.contactGroupId}`);
    return response.data;
}

interface createContactRequest {
    tenantId: string;
    body: {
        contactGroupIds: string[];
        firstName?: string;
        lastName?: string;
        email: string;
        phone?: string;
        description?: string;
    }
}

export const createContact = async (req: createContactRequest): Promise<Contact> => {
    const response = await APIHandler.post(`/knowledge/tenant/${req.tenantId}/contact`, req.body);
    return response.data as Contact;
}

interface createMultipleContactsRequest {
    tenantId: string;
    body: {
        contacts: {
            contactGroupIds: string[];
            firstName?: string;
            lastName?: string;
            email: string;
            phone?: string;
            description?: string;
        }[]
    }
}

export const createMultipleContacts = async (req: createMultipleContactsRequest): Promise<Contact[]> => {
    const response = await APIHandler.post(`/knowledge/tenant/contact/bulk`, req.body);
    return response.data as Contact[];
}

interface updateContactRequest {
    tenantId: string;
    contactId: string;
    body: {
        contactGroupIds?: string[];
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        description?: string;
    }
}

export const updateContact = async (req: updateContactRequest): Promise<Contact> => {
    const response = await APIHandler.put(`/knowledge/tenant/${req.tenantId}/contact/${req.contactId}`, req.body);
    return response.data as Contact;
}

interface deleteContactRequest {
    tenantId: string;
    contactId: string;
}

export const deleteContact = async (req: deleteContactRequest): Promise<void> => {
    const response = await APIHandler.delete(`/knowledge/tenant/${req.tenantId}/contact/${req.contactId}`);
    return response.data;
}



