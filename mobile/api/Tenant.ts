import APIHandler, { getUVCFilterParams, UVCFilterObject, UVCMetadata } from "./APIHandler";
import { CalendarEvent } from "./Calendar";
import { Domain } from "./Domain";

export enum TenantDashboardItemType {
    EVENT = "EVENT",
    WIKI = "WIKI",
    PROFILE_NEWS = "PROFILE_NEWS",
    PROFILE_PROJECT = "PROFILE_PROJECT",
    PROJECT = "PROJECT",
    SURVEY = "SURVEY",
}

export type TenantVisibility = "PUBLIC" | "HIDDEN" | "ON_REQUEST";

export interface Tenant {
    _id: string;
    title: string;
    description?: string;
    domain?: string | Domain;
    visibility: TenantVisibility;
    integrations: {
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

export interface TenantUser {
    _id: string;
    firstName: string;
    lastName: string;
    group_id: string;
    group_permission: number;
}

export interface TenantInvitation {
    _id: string;
    mail: string;
    permissionLevel: number;
    date: string;
}

interface getTenantsRequest {
    params?: {
        domain?: string;
        visibility?: TenantVisibility;
    }
}

export const getTenants = async (req: getTenantsRequest) => {
    const response = await APIHandler.get('/tenant/public/tenant', {
        params: req.params,
    });
    return response.data as Tenant[];
}

export const getUserTenants = async () => {
    const response = await APIHandler.get('/tenant/user/tenant');
    return response.data as Tenant[];
}

interface getTenantRequest {
    id?: string;
    params?: UVCFilterObject | null;
}

export interface getTenantResponse {
    tenant: Tenant;
    users: TenantUser[];
}

export const getTenant = async (req: getTenantRequest) => {
    if (!req.id) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/tenant/tenant/${req.id}`, {
        params: getUVCFilterParams(req.params || null),
    });
    return response.data as getTenantResponse;
}

export interface getTenantDashboardRequest {
    tenantId: string;   
}

export const getTenantDashboard = async (req: getTenantDashboardRequest) => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/dashboard`);
    return response.data as {
        calendarEvents: CalendarEvent[];
        dashboardItems: (UVCMetadata & { type: TenantDashboardItemType })[];
    };
}

export const getInvitationsByTenant = async (req: { tenantId: string }) => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/invitation`);
    return response.data as TenantInvitation[];
}

export const deleteTenantInvitation = async (req: { tenantId: string; invitationId: string }) => {
    const response = await APIHandler.delete(`/tenant/tenant/${req.tenantId}/invitation/${req.invitationId}`);
    return response.data;
}

export const getUserTenantInvitations = async () => {
    const response = await APIHandler.get(`/tenant/user/invitation`);
    return response.data as (TenantInvitation & { tenant: Tenant })[];
}

export interface createInvitationRequest {
    body: {
        tenantId: string;
        mail: string;
        permissionLevel: number;
    }
}

export const createInvitation = async (req: createInvitationRequest) => {
    const response = await APIHandler.post(`/tenant/tenant/${req.body.tenantId}/invitation`, req.body);
    return response.data as TenantInvitation;
}


interface acceptInvitationRequest {
    invitationId: string;
}

export const acceptInvitation = async (req: acceptInvitationRequest) => {
    const response = await APIHandler.put(`/tenant/user/invitation/${req.invitationId}`);
    return response.data as TenantInvitation;
}

interface declineInvitationRequest {
    invitationId: string;
}

export const declineInvitation = async (req: declineInvitationRequest) => {
    const response = await APIHandler.delete(`/tenant/user/invitation/${req.invitationId}`);
    return response.data as TenantInvitation;
}

interface updateUsersGroupRequest {
    groupId: string,
    body: {
        userId: string,
        permissionLevel: number,
    }
}

export const updateUsersGroup = async (req: updateUsersGroupRequest) => {
    const response = await APIHandler.put(`/auth/tenant/${req.groupId}/user/update`, req.body);
    return response.data as TenantUser;
}

interface deleteUsersGroupRequest {
    groupId: string,
    userId: string,
}

export const deleteUsersGroup = async (req: deleteUsersGroupRequest) => {
    const response = await APIHandler.delete(`/auth/tenant/${req.groupId}/user/remove/${req.userId}`);
    return response.data as TenantUser;
}

export interface updateTenantRequest {
    id?: string;
    body: {
        title?: string;
        description?: string;
        domain?: string;
        visibility?: TenantVisibility;
        integrations?: {
            dashboard?: boolean;
            documentation?: boolean;
            calendar?: boolean;
            survey?: boolean;
            chat?: boolean;
            budget?: boolean;
            knowledge?: boolean;
            event?: boolean;
            project?: boolean;
        }
    }
}

export const updateTenant = async (req: updateTenantRequest) => {
    if (!req.id) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`/tenant/tenant/${req.id}`, req.body);
    return response.data as Tenant;
}

interface joinTenantRequest {
    tenantId: string;
}

export const joinTenant = async (req: joinTenantRequest) => {
    const response = await APIHandler.post(`/tenant/user/join/${req.tenantId}`);
    return response.data as Tenant;
}