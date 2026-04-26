import { APIHandler } from "../base";
import { Domain, Tenant, TenantVisibility } from "./Types";

/**
 * Tenant Routes
 */

interface getTenantsRequest {
    params?: {
        domain?: string;
        visibility?: TenantVisibility;
    }
}

export const getTenants = async (req: getTenantsRequest) => {
    const response = await APIHandler.get('/tenant/public/tenant', {
        params: req.params,
    });
    return response.data as Tenant[];
}


/**
 * Domain Routes
 */


export const getDomains = async () => {
    const response = await APIHandler.get('/tenant/public/domain');
    return response.data as Domain[];
}

export const getDomain = async (req: { domainId: string }) => {
    const response = await APIHandler.get(`/tenant/public/domain/${req.domainId}`);
    return response.data as Domain;
}

export interface postSaasOfferRequest {
    name: string;
    email: string;
    organization?: string;
    message?: string;
    website?: string;
}

export const postSaasOffer = async (req: postSaasOfferRequest) => {
    const response = await APIHandler.post("/tenant/public/saas-offer", req);
    return response.data as { ok: boolean };
}