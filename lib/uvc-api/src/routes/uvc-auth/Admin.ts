import { APIHandler } from "../base";
import { TimeSeriesType } from "../uvc-tenant/Types";
import { AuthStatistics, User } from "./Types";

export const getUsers = async () => {
    const response = await APIHandler.get('/auth/admin/user');
    return response.data as User[];
}

export interface getAdminUserByIdRequest {
    userId: string;
}

export const getAdminUserById = async (req: getAdminUserByIdRequest) => {
    const response = await APIHandler.get(`/auth/admin/user/${req.userId}`);
    return response.data as User;
}

export interface banUserRequest {
    userId: string;
}

export const banUser = async (req: banUserRequest) => {
    const response = await APIHandler.post(`/auth/admin/user/${req.userId}/ban`);
    return response.data;
}

export interface unbanUserRequest {
    userId: string;
}

export const unbanUser = async (req: unbanUserRequest) => {
    const response = await APIHandler.post(`/auth/admin/user/${req.userId}/unban`);
    return response.data;
}

interface getAuthStatisticsRequest {
    timeSeries?: TimeSeriesType;
    dateFrom?: string;
    dateTo?: string;
}

export const getAuthStatistics = async (req: getAuthStatisticsRequest): Promise<AuthStatistics> => {
    const params: Record<string, string> = {
        timeSeries: req.timeSeries || 'all'
    };
    if (req.dateFrom) params.dateFrom = req.dateFrom;
    if (req.dateTo) params.dateTo = req.dateTo;
    
    const response = await APIHandler.get('/auth/admin/stats', { params });
    return response.data as AuthStatistics;
}