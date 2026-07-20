import { TenantDashboardItemType } from "@/api/Tenant";

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