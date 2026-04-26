import { APIHandler } from "../base";
import { Notification, Tenant, TenantInvitation, TenantRequest } from "./Types";

export const getUserTenants = async () => {
    const response = await APIHandler.get('/tenant/user/tenant');
    return response.data as Tenant[];
}

export const getUserTenantInvitations = async () => {
    const response = await APIHandler.get(`/tenant/user/invitation`);
    return response.data as (TenantInvitation & { tenant: Tenant })[];
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

interface joinTenantRequest {
    tenantId: string;
}

export const joinTenant = async (req: joinTenantRequest) => {
    const response = await APIHandler.post(`/tenant/user/join/${req.tenantId}`);
    return response.data as Tenant;
}

interface createTenantJoinRequestRequest {
    tenantId: string;
}

export const createTenantJoinRequest = async (req: createTenantJoinRequestRequest) => {
    const response = await APIHandler.post(`/tenant/user/request/${req.tenantId}`);
    return response.data as TenantRequest;
}

export const getUserTenantRequests = async () => {
    const response = await APIHandler.get(`/tenant/user/request`);
    return response.data as (TenantRequest & { tenant: Tenant })[];
}

interface cancelUserTenantRequestRequest {
    requestId: string;
}

export const cancelUserTenantRequest = async (req: cancelUserTenantRequestRequest) => {
    const response = await APIHandler.delete(`/tenant/user/request/${req.requestId}`);
    return response.data;
}

export const markNotficationsAsSeen = async (): Promise<void> => {
    const response = await APIHandler.put(`tenant/user/notification/seen`);
    return response.data;
}

export const getUserNotifications = async () => {
    const response = await APIHandler.get(`tenant/user/notification`);
    return response.data as {
        notifications: (Notification & { tenantId: Tenant })[];
        unseenCount: number;
    };
}