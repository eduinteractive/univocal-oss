import { Router } from "express";
import { getNetworkTenantEvents, resetEventsACL } from "../controller/Event";
import * as StatisticsController from "../controller/Statistics";
import { getEventStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetEventsACL)
NetworkRouter.get("/tenant/:tenantId/events", getNetworkTenantEvents)
NetworkRouter.get("/stats", getEventStatisticsChain(), validateRequestSchema, StatisticsController.getEventStatistics)

export default NetworkRouter;