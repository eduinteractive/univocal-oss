import { Tenant } from "../uvc-tenant/Types";

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

export enum GROUP_PERMISSION_LEVEL {
    GUEST = 0,
    MEMBER = 1,
    MODERATOR = 2,
    ADMIN = 3,
}

export interface Groups {
    _id: string,
    permissionLevel: GROUP_PERMISSION_LEVEL,
    tenant?: Tenant;
}

export interface UserContact {
    first_name: string;
    last_name: string;
}

export type AuthProvider = "LOCAL" | "DFN_AAI";

export interface AuthData {
    _id: string;
    mail: string;
    permissionLevel: PERMISSION_LEVEL;
    groups: Groups[];
    domains: string[];
    dataProtectionAgreement: boolean;
    activationStatus: ActivationStatus;
    authProvider?: AuthProvider;
    /** Aus DFN-Prinzipal (subject-id) abgeleitet (Backend), kein IdP-Attribut */
    schacHomeOrganization?: string;
    lastSignDate: Date;
    registerDate: Date;
    contact: UserContact | string;
}

export interface User {
    _id: string;
    mail: string;
    firstName: string;
    lastName: string;
    groups: Groups[];
    activationStatus: ActivationStatus;
    lastSignDate: Date;
    registerDate: Date;
}

export interface AuthStatistics {
    totalUsers: number;
    registrations: {
        daily?: AuthTimeSeriesData[];
        weekly?: AuthTimeSeriesData[];
        monthly?: AuthTimeSeriesData[];
    };
    groupStatistics: AuthGroupStatistics[];
}

export interface AuthTimeSeriesData {
    date: string;
    count: number;
}

export interface AuthGroupStatistics {
    tenantId: string;
    tenantTitle: string;
    userCount: number;
}