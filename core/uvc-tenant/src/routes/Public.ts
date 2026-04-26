import { Router } from "express";
import * as DomainController from "../controller/Domain";
import * as LandingSaasOfferController from "../controller/LandingSaasOffer";
import * as TenantController from "../controller/Tenant";
import { currentUser, validateRequestSchema } from "@eduinteractive/uvc-common";
import { getDomainChain } from "../controller/Domain.validate";
import { postSaasOfferChain } from "../controller/LandingSaasOffer.validate";
import { getPublicTenantChain } from "../controller/Tenant.validate";

const PublicRouter = Router({ mergeParams: true });

PublicRouter.post("/saas-offer", postSaasOfferChain(), validateRequestSchema, LandingSaasOfferController.postSaasOffer);

PublicRouter.get("/tenant", currentUser, TenantController.getTenants);
PublicRouter.get("/tenant/:tenantId", getPublicTenantChain(), validateRequestSchema, TenantController.getPublicTenant)

PublicRouter.get("/domain", DomainController.getDomains);
PublicRouter.get("/domain/:domainId", getDomainChain(), validateRequestSchema, DomainController.getDomain,);


export default PublicRouter;