import { TenantDashboardItemType } from "@/api/Tenant";

export enum SV_PERMISSION_LEVEL {
    GUEST = 0,
    CLASS_SPEAKER = 1,
    SV_MEMBER = 2,
    SV_BOARD = 3,
    SV_TEACHER = 4,
    SV_ADMIN = 5
}

export const SV_PERMISSION_LEVELS = [
    { value: SV_PERMISSION_LEVEL.GUEST, label: 'Gast' },
    { value: SV_PERMISSION_LEVEL.CLASS_SPEAKER, label: 'Klassensprecher*in' },
    { value: SV_PERMISSION_LEVEL.SV_MEMBER, label: 'SV-Mitglied' },
    { value: SV_PERMISSION_LEVEL.SV_BOARD, label: 'SV-Vorstand' },
    { value: SV_PERMISSION_LEVEL.SV_TEACHER, label: 'Verbindungslehrer*in' },
    { value: SV_PERMISSION_LEVEL.SV_ADMIN, label: 'Schulsprecher*in' },
];

export enum NETWORK_PERMISSION_LEVEL {
    GUEST = 0,
    NETWORK_MEMBER = 1,
    NETWORK_ADMIN = 2,
}

export const NETWORK_PERMISSION_LEVELS = [
    { value: NETWORK_PERMISSION_LEVEL.GUEST, label: 'Gast' },
    { value: NETWORK_PERMISSION_LEVEL.NETWORK_MEMBER, label: 'Netzwerk-Mitglied' },
    { value: NETWORK_PERMISSION_LEVEL.NETWORK_ADMIN, label: 'Netzwerk-Administrator*in' },
];

export enum SSR_PERMISSION_LEVEL {
    GUEST = 0,
    SSR_MEMBER = 1,
    SSR_BOARD = 2,
    SSR_ADMIN = 3,
}

export const SSR_PERMISSION_LEVELS = [
    { value: SSR_PERMISSION_LEVEL.GUEST, label: 'Gast' },
    { value: SSR_PERMISSION_LEVEL.SSR_MEMBER, label: 'SSR-Mitglied' },
    { value: SSR_PERMISSION_LEVEL.SSR_BOARD, label: 'SSR-Vorstand' },
    { value: SSR_PERMISSION_LEVEL.SSR_ADMIN, label: 'SSR-Administrator' },
];

export enum PROFILE_OBJECT_STATUS {
    DRAFT = "DRAFT",
    EXAMINATION = "EXAMINATION",
    PUBLISHED = "PUBLISHED"
}

export const PROFILE_OBJECT_STATUS_STRINGS = {
    [PROFILE_OBJECT_STATUS.DRAFT]: 'Entwurf',
    [PROFILE_OBJECT_STATUS.EXAMINATION]: 'Prüfung',
    [PROFILE_OBJECT_STATUS.PUBLISHED]: 'Veröffentlicht'
}

export const TENANT_DASHBOARD_ITEM_TYPES_STRINGS = {
    [TenantDashboardItemType.EVENT]: 'Veranstaltung',
    [TenantDashboardItemType.WIKI]: 'Wiki',
    [TenantDashboardItemType.PROFILE_NEWS]: 'Neuigkeit',
    [TenantDashboardItemType.PROFILE_PROJECT]: 'Projekt',
    [TenantDashboardItemType.PROJECT]: 'Projekt',
    [TenantDashboardItemType.SURVEY]: 'Umfrage',
}