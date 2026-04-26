/**
 * Domain Types
 */

import { SVHMetadata } from "../base";

export interface Domain {
    _id: string;
    title: string;
    shortcode: string;
    idpIdentifier?: string;
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
    mail: string;
    firstName: string;
    lastName: string;
    group_id: string;
    group_permission: number;
}

export interface TenantInvitation {
    _id: string;
    tenant: string;
    mail: string;
    date: Date;
    permissionLevel: number;
    status?: string;
}

export enum TenantRequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
}

export interface TenantRequest {
    _id: string;
    tenant: string;
    requesterId: string;
    mail: string;
    date: Date;
    status: TenantRequestStatus;
}

export enum TenantDashboardItemType {
    EVENT = "EVENT",
    WIKI = "WIKI",
    PROFILE_NEWS = "PROFILE_NEWS",
    PROFILE_PROJECT = "PROFILE_PROJECT",
    PROJECT = "PROJECT",
}

/**
 * Budget Types
 */

export interface Budget extends SVHMetadata {
    _id: string;
    year?: number;
    ist_active?: boolean;
}

export enum BudgetPositionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    GROUP_INCOME = 'GROUP_INCOME',
    GROUP_EXPENSE = 'GROUP_EXPENSE',
}

export interface BudgetPosition {
    _id: string;
    budgetId: string;
    next?: string;
    parent?: string;
    title: string;
    description?: string;
    type: BudgetPositionType;
    soll_amount: number;
    ist_amount?: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Notification Types
 */

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

/**
 * Statistics Types
 */

export type TimeSeriesType = 'daily' | 'weekly' | 'monthly' | 'all';

export interface TenantTimeSeriesData {
    date: string;
    count: number;
}

export interface TimeSeries {
    daily?: TenantTimeSeriesData[];
    weekly?: TenantTimeSeriesData[];
    monthly?: TenantTimeSeriesData[];
}

export interface CalendarStatistics {
    totalEvents: number;
    events: TimeSeries;
}

export interface EventStatistics {
    totalEvents: number;
    events: TimeSeries;
}

export interface KnowledgeStatistics {
    totalContacts: number;
    totalWikis: number;
    contacts: TimeSeries;
    wikis: TimeSeries;
}

export interface ProfileStatistics {
    totalNews: number;
    totalProjects: number;
    news: TimeSeries;
    projects: TimeSeries;
}

export interface ProjectStatistics {
    totalProjects: number;
    projects: TimeSeries;
}

export interface SurveyStatistics {
    totalSurveys: number;
    surveys: TimeSeries;
}

export interface BudgetStatistics {
    totalBudgets: number;
    budgets: TimeSeries;
}

export interface ServiceStatisticsError {
    error: string;
}

export interface TenantStatistics {
    calendar: CalendarStatistics | ServiceStatisticsError;
    event: EventStatistics | ServiceStatisticsError;
    knowledge: KnowledgeStatistics | ServiceStatisticsError;
    profile: ProfileStatistics | ServiceStatisticsError;
    project: ProjectStatistics | ServiceStatisticsError;
    survey: SurveyStatistics | ServiceStatisticsError;
    budget: BudgetStatistics | ServiceStatisticsError;
}