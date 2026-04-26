import { Router } from "express";
import { resetProfileACL } from "../controller/Network";
import * as StatisticsController from "../controller/Statistics";
import { getProfileStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetProfileACL)
NetworkRouter.get("/stats", getProfileStatisticsChain(), validateRequestSchema, StatisticsController.getProfileStatistics)

export default NetworkRouter;