import { Router } from "express"
import * as GroupController from "../controller/Groups"
import { PERMISSION_LEVEL, requirePermission, requireTenant, requireTenantPermission, validateRequestSchema } from "@eduinteractive/uvc-common"
import { addUserToGroupChain, removeUserFromGroupChain, updateUserGroupChain } from "../controller/Groups.validate"

const TenantRouter = Router({ mergeParams: true })

/** Group Routes **/
TenantRouter.post("/user/add", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), addUserToGroupChain(), validateRequestSchema, GroupController.addUserToGroup)
TenantRouter.put("/user/update", requireTenant, requireTenantPermission("member:administration", false), updateUserGroupChain(), validateRequestSchema, GroupController.updateUserGroup)
TenantRouter.delete("/user/remove/:userId", requireTenant, requireTenantPermission("member:administration", false), removeUserFromGroupChain(), validateRequestSchema, GroupController.removeUserFromGroup)

export default TenantRouter