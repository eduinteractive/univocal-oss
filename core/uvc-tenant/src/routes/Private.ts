import { Router } from "express";
import * as TenantController from "../controller/Tenant";
import * as TenantInvitationController from "../controller/TenantInvitation";
import * as UserController from "../controller/User";
import { acceptInvitationChain, declineInvitationChain } from "../controller/TenantInvitation.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";
import { joinOpenNetworkTenantChain } from "../controller/User.validate";
import * as TenantRequestController from "../controller/TenantRequest";
import {
    cancelUserTenantRequestChain,
    createUserTenantRequestChain,
} from "../controller/TenantRequest.validate";

const PrivateRouter = Router({ mergeParams: true });

// User Routes
PrivateRouter.get("/user/invitation", TenantInvitationController.getUserInvitations);
PrivateRouter.put("/user/invitation/:invitationId", acceptInvitationChain(), validateRequestSchema, TenantInvitationController.acceptInvitation);
PrivateRouter.delete("/user/invitation/:invitationId", declineInvitationChain(), validateRequestSchema, TenantInvitationController.declineInvitation);

PrivateRouter.post("/user/join/:tenantId", joinOpenNetworkTenantChain(), validateRequestSchema, UserController.joinOpenNetworkTenant)
PrivateRouter.post("/user/request/:tenantId", createUserTenantRequestChain(), validateRequestSchema, TenantRequestController.createUserTenantRequest);
PrivateRouter.get("/user/request", TenantRequestController.getUserTenantRequests);
PrivateRouter.delete("/user/request/:requestId", cancelUserTenantRequestChain(), validateRequestSchema, TenantRequestController.cancelUserTenantRequest);
PrivateRouter.get("/user/tenant", TenantController.getUserTenants) // Get Tenant by User
PrivateRouter.get("/user/notification", UserController.getUserNotifications)
PrivateRouter.put("/user/notification/seen", UserController.markUserNotificationsAsSeen)

export default PrivateRouter;