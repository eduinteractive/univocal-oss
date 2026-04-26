import APIHandler from "./APIHandler";
import { Tenant } from "./Tenant";

export enum NotificationType {
    INFO = "INFO",
}

export interface Notification {
    _id: string;
    tenantId?: string;
    authorId: string;
    content: string;
    type: NotificationType;
    creationDate: Date;
}

export interface createNotificationRequest {
    tenantId: string;
    body: {
        content: string;
    }
}

export const createNotification = async (req: createNotificationRequest): Promise<Notification> => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.post(`tenant/tenant/${req.tenantId}/notification`, req.body);
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