import { Router } from "express";
import { resetProjectsACL } from "../controller/Project";
import * as StatisticsController from "../controller/Statistics";
import { getProjectStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetProjectsACL)
NetworkRouter.get("/stats", getProjectStatisticsChain(), validateRequestSchema, StatisticsController.getProjectStatistics)

export default NetworkRouter;