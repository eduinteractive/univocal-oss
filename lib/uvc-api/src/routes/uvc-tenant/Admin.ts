import { APIHandler } from "../base";
import { createInvitationRequest, updateTenantRequest } from "./Tenant";
import { Domain, Tenant, TenantInvitation, TenantStatistics, TenantVisibility, TimeSeriesType } from "./Types";

/**
 * Tenant Routes
 */

export interface createTenantRequest {
    body: {
        title: string;
        description?: string;
        domain: string;
        visibility: TenantVisibility;
        integrations?: {
            dashboard: boolean;
            documentation: boolean;
            calendar: boolean;
            survey: boolean;
            chat: boolean;
            budget: boolean;
            knowledge: boolean;
            event: boolean;
            project: boolean;
        }
    }
}

export const createTenant = async (req: createTenantRequest) => {
    const response = await APIHandler.post('/tenant/admin/tenant', req.body);
    return response.data as Tenant;
}

interface deleteTenantRequest {
    id: string;
}

export const deleteTenant = async (req: deleteTenantRequest) => {
    const response = await APIHandler.delete(`/tenant/admin/tenant/${req.id}`);
    return response.data as Tenant;
}

interface importTenantsRequest {
    body: {
        domain?: string;
        data: { name: string }[];
    }
}

export const importTenants = async (req: importTenantsRequest) => {
    const response = await APIHandler.post('/tenant/admin/tenant/import', req.body);
    return response.data as Tenant[];
}

/**
 * Tenant Invitation Routes
 */
interface createTenantInvitationRequest {
    tenantId: string;
    body: {
        mail: string;
        permissionLevel: number;
    }
}

export const createTenantInvitation = async (req: createTenantInvitationRequest) => {
    const response = await APIHandler.post(`/tenant/admin/tenant/${req.tenantId}/invitation`, req.body);
    return response.data as TenantInvitation;
}

export interface getTenantInvitationsRequest {
    tenantId: string;
}

export const getTenantInvitations = async (req: getTenantInvitationsRequest) => {
    const response = await APIHandler.get(`/tenant/admin/tenant/${req.tenantId}/invitation`);
    return response.data as TenantInvitation[];
}

/**
 * Domain Routes
 */

interface createDomainRequest {
    body: {
        title: string;
        shortcode: string;
        idpIdentifier?: string;
    }
}

export const createDomain = async (req: createDomainRequest) => {
    const response = await APIHandler.post('/tenant/admin/domain', req.body);
    return response.data as Domain;
}

interface updateDomainRequest {
    domainId: string;
    body: {
        title?: string;
        shortcode?: string;
        idpIdentifier?: string;
    }
}

export const updateDomain = async (req: updateDomainRequest) => {
    const response = await APIHandler.put(`/tenant/admin/domain/${req.domainId}`, req.body);
    return response.data as Domain;
}

interface deleteDomainRequest {
    domainId: string;
}

export const deleteDomain = async (req: deleteDomainRequest) => {
    const response = await APIHandler.delete(`/tenant/admin/domain/${req.domainId}`);
    return response.data as Domain;
}

export const createDomainTenant = async (req: createTenantRequest) => {
    const response = await APIHandler.post(`/tenant/admin/domain/${req.body.domain}/tenant`, req.body);
    return response.data as Tenant;
}

export const updateDomainTenant = async (req: updateTenantRequest) => {
    if (!req.id) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/tenant/admin/domain/${req.body.domain}/tenant/${req.id}`, req.body);
    return response.data as Tenant;
}

export const createDomainInvitation = async (req: createInvitationRequest & { domainId: string }) => {
    const response = await APIHandler.post(`/tenant/admin/domain/${req.domainId}/tenant/${req.body.tenantId}/invitation`, req.body);
    return response.data as TenantInvitation;
}

/**
 * Statistics Routes
 */

interface getTenantStatisticsRequest {
    timeSeries?: TimeSeriesType;
    dateFrom?: string;
    dateTo?: string;
}

export const getTenantStatistics = async (req: getTenantStatisticsRequest): Promise<TenantStatistics> => {
    const params: Record<string, string> = {
        timeSeries: req.timeSeries || 'all'
    };
    if (req.dateFrom) params.dateFrom = req.dateFrom;
    if (req.dateTo) params.dateTo = req.dateTo;
    
    const response = await APIHandler.get('/tenant/admin/stats', { params });
    return response.data as TenantStatistics;
}