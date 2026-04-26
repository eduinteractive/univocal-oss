import { Router } from "express";
import * as GroupController from "../controller/Groups";
import * as UserController from "../controller/User";
import { changePasswordChain, getUserByIdChain, sendPushNotificationChain, updateUserChain, updateUserPushTokenChain } from "../controller/User.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const PrivateRouter = Router({ mergeParams: true });

PrivateRouter.get("/user", GroupController.getUsersInSameGroups)
PrivateRouter.put("/user", updateUserChain(), validateRequestSchema, UserController.updateUser)
PrivateRouter.post("/user/change-password", changePasswordChain(), validateRequestSchema, UserController.changePassword)
PrivateRouter.post("/user/push-token", updateUserPushTokenChain(), validateRequestSchema, UserController.updateUserPushToken)
PrivateRouter.get("/user/:userId", getUserByIdChain(), validateRequestSchema, UserController.getUserById)


export default PrivateRouter;