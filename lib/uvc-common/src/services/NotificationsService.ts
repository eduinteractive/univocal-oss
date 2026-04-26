import { Request } from "express";
import { NetworkAxios } from "../helper/Network";

export interface sendPushNotificationRequest {
    userId?: string;
    userIds?: string[];
    groupId?: string;
    permissionLevel?: number;
    title: string;
    message: string;
}

export const sendPushNotification = async (body: sendPushNotificationRequest, req: Request) => {
    try {
        const response = await NetworkAxios.post(`http://svh-auth-srv:3001/api/auth/network/users/push-notification`, body, {
            timeout: 10000, // 10 second timeout
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            error: 'Push notification service temporarily unavailable'
        };
    }
}