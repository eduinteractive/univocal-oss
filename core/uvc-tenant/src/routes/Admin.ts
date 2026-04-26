import { PERMISSION_LEVEL, requireDomainPermission, requirePermission, validateRequestSchema } from "@eduinteractive/uvc-common";
import { Router } from "express";
import * as DomainController from "../controller/Domain";
import * as TenantController from "../controller/Tenant";
import * as TenantInvitationController from "../controller/TenantInvitation";
import * as StatisticsController from "../controller/Statistics";
import { createTenantChain, deleteTenantChain, importTenantsChain, updateTenantChain } from "../controller/Tenant.validate";
import { createDomainChain, deleteDomainChain, updateDomainChain } from "../controller/Domain.validate";
import { createInvitationChain, getTenantInvitationsAdminChain } from "../controller/TenantInvitation.validate";
import { getTenantStatisticsChain } from "../controller/Statistics.validate";

const AdminRouter = Router({ mergeParams: true });

// Tenant Routes
AdminRouter.post("/tenant", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), createTenantChain(), validateRequestSchema, TenantController.createTenant) // Create Tenant
AdminRouter.post("/tenant/import", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), importTenantsChain(), validateRequestSchema, TenantController.importTenants) // Create Tenant
AdminRouter.delete("/tenant/:tenantId", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), deleteTenantChain(), validateRequestSchema, TenantController.deleteTenant) // Delete Tenant

// Tenant Invitation Routes
AdminRouter.get("/tenant/:tenantId/invitation", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), getTenantInvitationsAdminChain(), validateRequestSchema, TenantInvitationController.getTenantInvitationsAdmin);
AdminRouter.post("/tenant/:tenantId/invitation", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), createInvitationChain(), validateRequestSchema, TenantInvitationController.createInvitation);

// Domain Routes
AdminRouter.post("/domain", requirePermission(PERMISSION_LEVEL.SV_HUB_ADMINISTRATION), createDomainChain(), validateRequestSchema, DomainController.createDomain) // Create Domain
AdminRouter.put("/domain/:domainId", requirePermission(PERMISSION_LEVEL.SV_HUB_ADMINISTRATION), updateDomainChain(), validateRequestSchema, DomainController.updateDomain) // Update Domain
AdminRouter.delete("/domain/:domainId", requirePermission(PERMISSION_LEVEL.SV_HUB_ADMINISTRATION), deleteDomainChain(), validateRequestSchema, DomainController.deleteDomain) // Delete Domain
AdminRouter.post("/domain/:domainId/tenant", requireDomainPermission, createTenantChain(), validateRequestSchema, TenantController.createTenant);
AdminRouter.put("/domain/:domainId/tenant/:tenantId", requireDomainPermission, updateTenantChain(), validateRequestSchema, TenantController.updateTenant);
AdminRouter.post("/domain/:domainId/tenant/:tenantId/invitation", requireDomainPermission, createInvitationChain(), validateRequestSchema, TenantInvitationController.createInvitation);

// Statistics Routes
AdminRouter.get("/stats", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), getTenantStatisticsChain(), validateRequestSchema, StatisticsController.getTenantStatistics);

export default AdminRouter;