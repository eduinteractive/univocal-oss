import { Router } from "express";
import { resetEventsACL } from "../controller/Event";
import * as StatisticsController from "../controller/Statistics";
import { getEventStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetEventsACL)
NetworkRouter.get("/stats", getEventStatisticsChain(), validateRequestSchema, StatisticsController.getEventStatistics)

export default NetworkRouter;