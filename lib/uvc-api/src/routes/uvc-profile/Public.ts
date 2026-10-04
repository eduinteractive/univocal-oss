import { APIHandler } from "../base";
import {
    Profile,
    News,
    TenantProject,
    PublicSite,
    PublicSitePage,
    PublicSurveyResults,
    SUPPORT_REQUEST_STATUS,
    SUPPORT_RESPONSE_KIND,
} from "./Types";

export const getPublicProfile = async (tenantId: string) => {
    const response = await APIHandler.get(`/profile/public/profile/${tenantId}`);
    return response.data as {
        profile: Profile & { title?: string; site?: { subdomain: string; published: true } };
        news: News[];
        projects: TenantProject[];
    };
}

export const getPublicSite = async (subdomain: string) => {
    const response = await APIHandler.get(`/profile/public/site/${encodeURIComponent(subdomain)}`);
    return response.data as PublicSite;
}

interface getPublicSitePageRequest {
    subdomain: string;
    slug: string;
}

export const getPublicSitePage = async (req: getPublicSitePageRequest) => {
    const response = await APIHandler.get(`/profile/public/site/${encodeURIComponent(req.subdomain)}/pages/${encodeURIComponent(req.slug)}`);
    return response.data as {
        tenant: { _id: string; title: string };
        page: PublicSitePage;
    };
}

interface getPublicSupportRequestRequest {
    subdomain: string;
    requestId: string;
}

export const getPublicSupportRequest = async (req: getPublicSupportRequestRequest) => {
    const response = await APIHandler.get(`/profile/public/site/${encodeURIComponent(req.subdomain)}/support/${req.requestId}`);
    return response.data as {
        tenant: { _id: string; title: string };
        request: {
            _id: string;
            title: string;
            description: string;
            status: SUPPORT_REQUEST_STATUS;
            publishDate?: Date;
        };
    };
}

interface createPublicSupportResponseRequest {
    subdomain: string;
    requestId: string;
    body: {
        kind: SUPPORT_RESPONSE_KIND;
        name?: string;
        email: string;
        message: string;
        website?: string;
    };
}

export const createPublicSupportResponse = async (req: createPublicSupportResponseRequest) => {
    const response = await APIHandler.post(`/profile/public/site/${encodeURIComponent(req.subdomain)}/support/${req.requestId}/responses`, req.body);
    return response.data as { success: boolean };
}

interface getPublicSurveyResultsRequest {
    subdomain: string;
    surveyId: string;
}

export const getPublicSurveyResults = async (req: getPublicSurveyResultsRequest) => {
    const response = await APIHandler.get(`/profile/public/site/${encodeURIComponent(req.subdomain)}/surveys/${req.surveyId}/results`);
    return response.data as PublicSurveyResults;
}
