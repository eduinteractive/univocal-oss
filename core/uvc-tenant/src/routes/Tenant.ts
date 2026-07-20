import { Router } from "express";
import * as BudgetController from "../controller/Budget";
import * as TenantController from "../controller/Tenant";
import * as TenantInvitationController from "../controller/TenantInvitation";
import * as TenantRequestController from "../controller/TenantRequest";
import { requireTenantPermission, validateRequestSchema } from "@eduinteractive/uvc-common";
import { isBudgetAuthor } from "../middlewares/isBudgetAuthor";
import { createNotificationChain, deleteNotificationChain, markNotificationAsSeenChain, reportTenantIssueChain, updateTenantChain } from "../controller/Tenant.validate";
import { createBudgetChain, createBudgetPositionChain, deleteBudgetChain, deleteBudgetPositionChain, getBudgetChain, getBudgetPositionsChain, updateBudgetChain, updateBudgetPositionChain } from "../controller/Budget.validate";
import { createInvitationChain, deleteTenantInvitationChain } from "../controller/TenantInvitation.validate";
import { acceptTenantRequestChain, rejectTenantRequestChain } from "../controller/TenantRequest.validate";

const TenantRouter = Router({ mergeParams: true });

// Tenant Routes
TenantRouter.get("/", TenantController.getTenant)
TenantRouter.put("/", requireTenantPermission('tenant:administration', false), updateTenantChain(), validateRequestSchema, TenantController.updateTenant)
TenantRouter.get("/dashboard", TenantController.getTenantDashboard)

// Budget Routes
TenantRouter.get("/budget",  BudgetController.getBudgets);
TenantRouter.get("/budgetstatistics",  BudgetController.getBudgetsStatistics);
TenantRouter.post("/budget",  requireTenantPermission('budget:create', false), createBudgetChain(), validateRequestSchema, BudgetController.createBudget);
TenantRouter.get("/budget/:budgetId",  getBudgetChain(), validateRequestSchema, BudgetController.getBudget)
TenantRouter.put("/budget/:budgetId",  requireTenantPermission('budget:edit', true), isBudgetAuthor, updateBudgetChain(), validateRequestSchema, BudgetController.updateBudget);
TenantRouter.delete("/budget/:budgetId",  requireTenantPermission('budget:delete', true), isBudgetAuthor, deleteBudgetChain(), validateRequestSchema, BudgetController.deleteBudget);

// Budget Position Routes
TenantRouter.get("/budget/:budgetId/position",  getBudgetPositionsChain(), validateRequestSchema, BudgetController.getBudgetPositions);
TenantRouter.post("/budget/:budgetId/position",  requireTenantPermission('budget:edit', true), isBudgetAuthor, createBudgetPositionChain(), validateRequestSchema, BudgetController.createBudgetPosition);
TenantRouter.put("/budget/:budgetId/position/:positionId",  requireTenantPermission('budget:edit', true), isBudgetAuthor, updateBudgetPositionChain(), validateRequestSchema, BudgetController.updateBudgetPosition);
TenantRouter.delete("/budget/:budgetId/position/:positionId",  requireTenantPermission('budget:edit', true), isBudgetAuthor, deleteBudgetPositionChain(), validateRequestSchema, BudgetController.deleteBudgetPosition);

// Notifications Routes
TenantRouter.get("/notification", TenantController.getNotifications)
TenantRouter.post("/notification", requireTenantPermission('tenant:administration', false), createNotificationChain(), validateRequestSchema, TenantController.createNotification)
TenantRouter.delete("/notification/:notificationId", requireTenantPermission('tenant:administration', false), deleteNotificationChain(), validateRequestSchema, TenantController.deleteNotification)
TenantRouter.put("/notification/:notificationId/seen", markNotificationAsSeenChain(), validateRequestSchema, TenantController.markNotificationAsSeen)

// Tenant Invitation Routes
TenantRouter.post("/invitation", requireTenantPermission('member:administration', false), createInvitationChain(), validateRequestSchema, TenantInvitationController.createInvitation);
TenantRouter.get("/invitation", requireTenantPermission('member:administration', false), TenantInvitationController.getTenantInvitations);
TenantRouter.delete("/invitation/:invitationId", requireTenantPermission('member:administration', false), deleteTenantInvitationChain(), validateRequestSchema, TenantInvitationController.deleteTenantInvitation);

// Tenant join requests (visibility ON_REQUEST)
TenantRouter.get("/request", requireTenantPermission('member:administration', false), TenantRequestController.getTenantRequests);
TenantRouter.put("/request/:requestId/accept", requireTenantPermission('member:administration', false), acceptTenantRequestChain(), validateRequestSchema, TenantRequestController.acceptTenantRequest);
TenantRouter.put("/request/:requestId/reject", requireTenantPermission('member:administration', false), rejectTenantRequestChain(), validateRequestSchema, TenantRequestController.rejectTenantRequest);

// Tenant Issue Routes
TenantRouter.post("/issue", reportTenantIssueChain(), validateRequestSchema, TenantController.reportTenantIssue);

export default TenantRouter;