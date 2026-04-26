import { PERMISSION_LEVEL, requirePermission, validateRequestSchema } from "@eduinteractive/uvc-common";
import { Router } from "express";
import * as ReportController from "../controller/Report";
import { updateReportChain } from "../controller/Report.validate";

const AdminRouter = Router({ mergeParams: true });

AdminRouter.get("/report", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), ReportController.getReports);
AdminRouter.get("/report/:reportId", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), ReportController.getReport);
AdminRouter.put("/report/:reportId", requirePermission(PERMISSION_LEVEL.SV_HUB_MODERATION), updateReportChain(), validateRequestSchema, ReportController.updateReportRequest);

export default AdminRouter;