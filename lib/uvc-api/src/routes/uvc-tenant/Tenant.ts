import { APIHandler, createSVHMetadataAttrs, getSVHFilterParams, SVHFilterObject, SVHMetadata, updateSVHMetadataAttrs } from "../base";
import { CalendarEvent } from "../uvc-calendar/Types";
import { Budget, BudgetPosition, BudgetPositionType, BudgetReceipt, Notification, Tenant, TenantInvitation, TenantRequest, TenantUser, TenantVisibility } from "./Types";

/**
 * Tenant Routes
 */

interface getTenantRequest {
    id?: string;
    params?: SVHFilterObject | null;
}

interface getTenantResponse {
    tenant: Tenant;
    users: TenantUser[];
}

export const getTenant = async (req: getTenantRequest) => {
    if (!req.id) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/tenant/tenant/${req.id}`, {
        params: getSVHFilterParams(req.params || null),
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
        dashboardItems: SVHMetadata[];
    }[];
}

export interface reportTenantIssueRequest {
    body: {
        type: "FEATURE_REQUEST" | "BUG_REPORT" | "OTHER";
        description: string;
        url: string;
    }
    tenantId?: string;
}

export const reportTenantIssue = async (req: reportTenantIssueRequest) => {
    const endpoint = req.tenantId
        ? `/tenant/tenant/${req.tenantId}/issue`
        : `/tenant/user/issue`;
    const response = await APIHandler.post(endpoint, req.body);
    return response.data as void;
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

interface getInvitationsByTenantRequest {
    tenantId: string;
}

export const getInvitationsByTenant = async (req: getInvitationsByTenantRequest) => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/invitation`);
    return response.data as TenantInvitation[];
}

interface deleteTenantInvitationRequest {
    tenantId: string;
    invitationId: string;
}

export const deleteTenantInvitation = async (req: deleteTenantInvitationRequest) => {
    const response = await APIHandler.delete(`/tenant/tenant/${req.tenantId}/invitation/${req.invitationId}`);
    return response.data as TenantInvitation;
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

interface getTenantRequestsRequest {
    tenantId: string;
}

export const getTenantJoinRequests = async (req: getTenantRequestsRequest) => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/request`);
    return response.data as TenantRequest[];
}

interface acceptTenantJoinRequestRequest {
    tenantId: string;
    requestId: string;
    body?: { permissionLevel?: number };
}

export const acceptTenantJoinRequest = async (req: acceptTenantJoinRequestRequest) => {
    const response = await APIHandler.put(
        `/tenant/tenant/${req.tenantId}/request/${req.requestId}/accept`,
        req.body ?? {}
    );
    return response.data as TenantRequest;
}

interface rejectTenantJoinRequestRequest {
    tenantId: string;
    requestId: string;
}

export const rejectTenantJoinRequest = async (req: rejectTenantJoinRequestRequest) => {
    const response = await APIHandler.put(
        `/tenant/tenant/${req.tenantId}/request/${req.requestId}/reject`,
        {}
    );
    return response.data as TenantRequest;
}

/**
 * Budget Routes
 */


interface getBudgetsRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getBudgets = async (req: getBudgetsRequest): Promise<Budget[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget`, { params: getSVHFilterParams(req.params) });
    return response.data;
}

interface getBudgetsStatisticsRequest {
    tenantId: string;
    category: string;
}

export const getBudgetsStatistics = async (req: getBudgetsStatisticsRequest): Promise<{
    _id: string;
    title: string;
    income_soll: number;
    expense_soll: number;
    income_ist: number;
    expense_ist: number;
}[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budgetstatistics`, { params: { category: req.category } });
    return response.data;
}

interface getBudgetCategoriesRequest {
    tenantId: string;
}

export const getBudgetCategories = async (req: getBudgetCategoriesRequest): Promise<string[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budgetcategories`);
    return response.data;
}

interface getBudgetRequest {
    tenantId: string;
    budgetId: string;
}

export const getBudget = async (req: getBudgetRequest): Promise<{ budget: Budget, positions: BudgetPosition[] }> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}`);
    return response.data;
}

interface createBudgetRequest {
    tenantId: string;
    body: createSVHMetadataAttrs & {
        category?: string;
    }
}

export const createBudget = async (req: createBudgetRequest): Promise<Budget> => {
    const response = await APIHandler.post(`/tenant/tenant/${req.tenantId}/budget`, req.body);
    return response.data;
}

interface updateBudgetRequest {
    tenantId: string;
    budgetId: string;
    body: updateSVHMetadataAttrs & {
        category?: string;
        ist_active?: boolean;
        receipt_active?: boolean;
    }
}

export const updateBudget = async (req: updateBudgetRequest): Promise<Budget> => {
    const response = await APIHandler.put(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}`, req.body);
    return response.data;
}

interface deleteBudgetRequest {
    tenantId: string;
    budgetId: string;
}

export const deleteBudget = async (req: deleteBudgetRequest): Promise<void> => {
    await APIHandler.delete(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}`);
}

interface getBudgetPositionsRequest {
    tenantId: string;
    budgetId: string;
}

export const getBudgetPositions = async (req: getBudgetPositionsRequest): Promise<BudgetPosition[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position`);
    return response.data;
}

interface createBudgetPositionRequest {
    tenantId: string;
    budgetId: string;
    body: {
        title: string;
        description?: string;
        type: BudgetPositionType;
        soll_amount: number;
        ist_amount?: number;
        parent?: string;
    }
}

export const createBudgetPosition = async (req: createBudgetPositionRequest): Promise<BudgetPosition> => {
    const response = await APIHandler.post(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position`, req.body);
    return response.data;
}

interface updateBudgetPositionRequest {
    tenantId: string;
    budgetId: string;
    positionId: string;
    body: {
        title: string;
        description: string;
        type: BudgetPositionType;
        soll_amount: number;
        ist_amount?: number;
    }
}

export const updateBudgetPosition = async (req: updateBudgetPositionRequest): Promise<BudgetPosition> => {
    const response = await APIHandler.put(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position/${req.positionId}`, req.body);
    return response.data;
}

interface deleteBudgetPositionRequest {
    tenantId: string;
    budgetId: string;
    positionId: string;
}

export const deleteBudgetPosition = async (req: deleteBudgetPositionRequest): Promise<void> => {
    await APIHandler.delete(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position/${req.positionId}`);
}

/**
 * Budget Receipt Routes
 */

interface getBudgetReceiptsRequest {
    tenantId: string;
    budgetId: string;
}

export const getBudgetReceipts = async (req: getBudgetReceiptsRequest): Promise<BudgetReceipt[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt`);
    return response.data;
}

interface createBudgetReceiptRequest {
    tenantId: string;
    budgetId: string;
    body: {
        positionId?: string;
        amount: number;
        description?: string;
        date: string | Date;
        newFile?: File;
    }
}

export const createBudgetReceipt = async (req: createBudgetReceiptRequest): Promise<BudgetReceipt> => {
    const formData = new FormData();
    if (req.body.positionId) formData.append("positionId", req.body.positionId);
    formData.append("amount", String(req.body.amount));
    if (req.body.description !== undefined) formData.append("description", req.body.description);
    formData.append(
        "date",
        typeof req.body.date === "string" ? req.body.date : req.body.date.toISOString()
    );
    if (req.body.newFile) formData.append("newFile", req.body.newFile);

    const response = await APIHandler.post(
        `/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
}

interface updateBudgetReceiptRequest {
    tenantId: string;
    budgetId: string;
    receiptId: string;
    body: {
        positionId: string;
        amount?: number;
        description?: string;
        date?: string | Date;
        file?: { title: string; link: string; mimetype: string };
        newFile?: File;
    }
}

export const updateBudgetReceipt = async (req: updateBudgetReceiptRequest): Promise<BudgetReceipt> => {
    const formData = new FormData();
    formData.append("positionId", req.body.positionId);
    if (req.body.amount !== undefined) formData.append("amount", String(req.body.amount));
    if (req.body.description !== undefined) formData.append("description", req.body.description);
    if (req.body.date !== undefined) {
        formData.append(
            "date",
            typeof req.body.date === "string" ? req.body.date : req.body.date.toISOString()
        );
    }
    if (req.body.newFile) {
        formData.append("newFile", req.body.newFile);
    } 
    if (req.body.file) formData.append("file", JSON.stringify(req.body.file));

    const response = await APIHandler.put(
        `/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt/${req.receiptId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
}

interface deleteBudgetReceiptRequest {
    tenantId: string;
    budgetId: string;
    receiptId: string;
}

export const deleteBudgetReceipt = async (req: deleteBudgetReceiptRequest): Promise<void> => {
    await APIHandler.delete(
        `/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt/${req.receiptId}`
    );
}

/**
 * Notification Routes
 */

export interface createNotificationRequest {
    tenantId: string;
    body: {
        content: string;
    }
}

export const createNotification = async (req: createNotificationRequest): Promise<Notification> => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.post(`tenant/tenant/${req.tenantId}/notification`,req.body);
    return response.data as Notification;
}

export const getNotifications = async (tenantId: string): Promise<Notification[]> => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`tenant/tenant/${tenantId}/notification`);
    return response.data as Notification[];
}

export interface deleteNotificationRequest {
    tenantId: string;
    notificationId: string;
}

export const deleteNotification = async (req: deleteNotificationRequest): Promise<Notification> => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.delete(`tenant/tenant/${req.tenantId}/notification/${req.notificationId}`);
    return response.data as Notification;
}

export interface markNotificationAsSeenRequest {
    tenantId: string;
    notificationId: string;
}

export const markNotificationAsSeen = async (req: markNotificationAsSeenRequest): Promise<void> => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.put(`tenant/tenant/${req.tenantId}/notification/${req.notificationId}/seen`);
    return response.data;
}