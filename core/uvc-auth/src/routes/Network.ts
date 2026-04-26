import { Router } from "express";
import { banUserChain, sendPushNotificationChain } from "../controller/User.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";
import * as UserController from "../controller/User";
import { addUserToGroupChain } from "../controller/Groups.validate";
import * as GroupController from "../controller/Groups";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/user/add", addUserToGroupChain(), validateRequestSchema, GroupController.addUserToGroup)

NetworkRouter.post("/user/:userId/ban", banUserChain(), validateRequestSchema, UserController.banUser)
NetworkRouter.get("/user/:userId/email", UserController.getUserEmailById)
NetworkRouter.get("/users", UserController.getUsersByIds)
NetworkRouter.get("/users/tenant/:tenantId", GroupController.getUsersByGroup)
NetworkRouter.post("/users/push-notification", sendPushNotificationChain(), validateRequestSchema, UserController.sendPushNotification)




export default NetworkRouter;