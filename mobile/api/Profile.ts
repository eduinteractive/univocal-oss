import APIHandler from "./APIHandler";
import { News } from "./News";
import { TenantProject } from "./TenantProject";

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