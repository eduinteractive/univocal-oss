import { Router } from "express"
import * as UserController from "../controller/User"
import * as StatisticsController from "../controller/Statistics"
import { PERMISSION_LEVEL, requirePermission } from "@eduinteractive/uvc-common";
import { getAuthStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";
import { banUserChain, getUserByIdChain } from "../controller/User.validate";

const AdminRouter = Router({ mergeParams: true });

AdminRouter.get("/user", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), UserController.getUsers)
AdminRouter.get("/user/:userId", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), getUserByIdChain(), validateRequestSchema, UserController.getAdminUserById)
AdminRouter.post("/user/:userId/ban", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), banUserChain(), validateRequestSchema, UserController.banUser)
AdminRouter.post("/user/:userId/unban", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), banUserChain(), validateRequestSchema, UserController.unbanUser)
AdminRouter.get("/stats", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), getAuthStatisticsChain(), validateRequestSchema, StatisticsController.getAuthStatistics)

export default AdminRouter;