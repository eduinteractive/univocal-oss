import APIHandler from "./APIHandler";
import { Tenant, TenantType } from "./Tenant";

export enum ActivationStatus {
    NOT_VERIFIED = "NOT_VERIFIED",
    ACTIVATED = "ACTIVATED",
    BANNED = "BANNED",
}

export enum PERMISSION_LEVEL {
    GUEST = 0,
    SV_HUB_MEMBER = 1,
    SV_MEMBER = 2,
    SSR_MEMBER = 3,
    SSR_BOARD = 4,
    SSR_ADMIN = 5,
    SV_HUB_MODERATION = 6,
    SV_HUB_ADMINISTRATION = 7,
}

export enum SV_PERMISSION_LEVEL {
    GUEST = 0,
    CLASS_SPEAKER = 1,
    SV_MEMBER = 2,
    SV_BOARD = 3,
    SV_TEACHER = 4,
    SV_ADMIN = 5
}

export enum NETWORK_PERMISSION_LEVEL {
    GUEST = 0,
    NETWORK_MEMBER = 1,
    NETWORK_ADMIN = 2,
}

export enum SSR_PERMISSION_LEVEL {
    GUEST = 0,
    SSR_MEMBER = 1,
    SSR_BOARD = 2,
    SSR_ADMIN = 3,
}

export interface Groups {
    _id: string,
    type: TenantType
    permissionLevel: SV_PERMISSION_LEVEL | NETWORK_PERMISSION_LEVEL | SSR_PERMISSION_LEVEL,
    tenant?: Tenant;
}

export interface Contact {
    first_name: string;
    last_name: string;
    phone?: string;
}

export interface AuthData {
    _id: string;
    mail: string;
    permissionLevel: PERMISSION_LEVEL;
    groups: Groups[];
    domains: string[];
    dataProtectionAgreement: boolean;
    activationStatus: ActivationStatus;
    lastSignDate: Date;
    registerDate: Date;
    contact: Contact | string;
}

export const checkAuth = async () => {
    const response = await APIHandler.get('/auth/public/check');
    return response.data as AuthData;
}

export const refresh = async () => {
    const response = await APIHandler.get('/auth/public/refresh');
    return response.data as AuthData;
}

interface LoginRequest {
    body: {
        mail: string;
        password: string;
    }
}

export const login = async (req: LoginRequest) => {
    const response = await APIHandler.post('/auth/public/login', req.body);
    return response.data;
}

interface RegisterRequest {
    body: {
        mail: string;
        password: string;
        contact: {
            first_name: string;
            last_name: string;
            phone?: string;
        }
    }
}

export const register = async (req: RegisterRequest) => {
    const response = await APIHandler.post('/auth/public/register', req.body);
    return response.data;
}

export const logout = async () => {
    const response = await APIHandler.post('/auth/public/logout');
    return response.data;
}

interface ResetPasswordRequest {
    body: {
        mail: string;
    }
}

export const resetPassword = async (req: ResetPasswordRequest) => {
    const response = await APIHandler.post('/auth/public/reset-password', req.body);
    return response.data;
}


interface ChangePasswordRequest {
    body: {
        oldpassword: string;
        newpassword: string;
    }
}

export const changePassword = async (req: ChangePasswordRequest) => {
    const response = await APIHandler.post('/auth/private/user/change-password', req.body);
    return response.data;
}

interface UpdateUserPushTokenRequest {
    body: {
        pushToken: string;
    }
}

export const updateUserPushToken = async (req: UpdateUserPushTokenRequest) => {
    const response = await APIHandler.post('/auth/private/user/push-token', req.body);
    return response.data;
}