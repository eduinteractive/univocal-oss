/** API Federation */

import * as AuthAdmin from "./uvc-auth/Admin";
import * as AuthPrivate from "./uvc-auth/Private";
import * as AuthPublic from "./uvc-auth/Public";
import * as AuthTenant from "./uvc-auth/Tenant";

import * as CalendarAdmin from "./uvc-calendar/Admin";
import * as CalendarPrivate from "./uvc-calendar/Private";
import * as CalendarPublic from "./uvc-calendar/Public";
import * as CalendarTenant from "./uvc-calendar/Tenant";

import * as ChatAdmin from "./uvc-chat/Admin";
import * as ChatPrivate from "./uvc-chat/Private";
import * as ChatPublic from "./uvc-chat/Public";
import * as ChatTenant from "./uvc-chat/Tenant";

import * as EventAdmin from "./uvc-event/Admin";
import * as EventPrivate from "./uvc-event/Private";
import * as EventPublic from "./uvc-event/Public";
import * as EventTenant from "./uvc-event/Tenant";

import * as KnowledgeAdmin from "./uvc-knowledge/Admin";
import * as KnowledgePrivate from "./uvc-knowledge/Private";
import * as KnowledgePublic from "./uvc-knowledge/Public";
import * as KnowledgeTenant from "./uvc-knowledge/Tenant";

import * as ProfileAdmin from "./uvc-profile/Admin";
import * as ProfilePrivate from "./uvc-profile/Private";
import * as ProfilePublic from "./uvc-profile/Public";
import * as ProfileTenant from "./uvc-profile/Tenant";

import * as ProjectAdmin from "./uvc-project/Admin";
import * as ProjectPrivate from "./uvc-project/Private";
import * as ProjectPublic from "./uvc-project/Public";
import * as ProjectTenant from "./uvc-project/Tenant";

import * as SurveyAdmin from "./uvc-survey/Admin";
import * as SurveyPrivate from "./uvc-survey/Private";
import * as SurveyPublic from "./uvc-survey/Public";
import * as SurveyTenant from "./uvc-survey/Tenant";

import * as TenantAdmin from "./uvc-tenant/Admin";
import * as TenantPrivate from "./uvc-tenant/Private";
import * as TenantPublic from "./uvc-tenant/Public";
import * as TenantTenant from "./uvc-tenant/Tenant";

export class SAPI {
    public static AUTH = {
        ADMIN: AuthAdmin,
        PRIVATE: AuthPrivate,
        PUBLIC: AuthPublic,
        TENANT: AuthTenant,
    }

    public static CALENDAR = {
        ADMIN: CalendarAdmin,
        PRIVATE: CalendarPrivate,
        PUBLIC: CalendarPublic,
        TENANT: CalendarTenant,
    }

    public static CHAT = {
        ADMIN: ChatAdmin,
        PRIVATE: ChatPrivate,
        PUBLIC: ChatPublic,
        TENANT: ChatTenant,
    }

    public static EVENT = {
        ADMIN: EventAdmin,
        PRIVATE: EventPrivate,
        PUBLIC: EventPublic,
        TENANT: EventTenant,
    }

    public static KNOWLEDGE = {
        ADMIN: KnowledgeAdmin,
        PRIVATE: KnowledgePrivate,
        PUBLIC: KnowledgePublic,
        TENANT: KnowledgeTenant,
    }

    public static PROFILE = {
        ADMIN: ProfileAdmin,
        PRIVATE: ProfilePrivate,
        PUBLIC: ProfilePublic,
        TENANT: ProfileTenant,
    }

    public static PROJECT = {
        ADMIN: ProjectAdmin,
        PRIVATE: ProjectPrivate,
        PUBLIC: ProjectPublic,
        TENANT: ProjectTenant,
    }

    public static SURVEY = {
        ADMIN: SurveyAdmin,
        PRIVATE: SurveyPrivate,
        PUBLIC: SurveyPublic,
        TENANT: SurveyTenant,
    }

    public static TENANT = {
        ADMIN: TenantAdmin,
        PRIVATE: TenantPrivate,
        PUBLIC: TenantPublic,
        TENANT: TenantTenant,
    }
}

export const UVC_ASSETS_URL = "https://uvc-assets.s3.eu-central-3.ionoscloud.com"

export * from "./base";