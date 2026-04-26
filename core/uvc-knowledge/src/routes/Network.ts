import { Router } from "express";
import { resetKnowledgeACL } from "../controller/Network";
import * as StatisticsController from "../controller/Statistics";
import { getKnowledgeStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetKnowledgeACL)
NetworkRouter.get("/stats", getKnowledgeStatisticsChain(), validateRequestSchema, StatisticsController.getKnowledgeStatistics)

export default NetworkRouter;