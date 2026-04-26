import { Router } from "express";
import { resetSurveysACL } from "../controller/SurveyMeta";
import * as StatisticsController from "../controller/Statistics";
import { getSurveyStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetSurveysACL)
NetworkRouter.get("/stats", getSurveyStatisticsChain(), validateRequestSchema, StatisticsController.getSurveyStatistics)

export default NetworkRouter;