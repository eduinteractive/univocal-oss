import { Router } from "express";
import { resetSurveysACL } from "../controller/SurveyMeta";
import * as SurveyNetworkController from "../controller/SurveyNetwork";
import * as StatisticsController from "../controller/Statistics";
import { getSurveyStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.post("/tenant/:tenantId/resetacl", resetSurveysACL)
NetworkRouter.get("/tenant/:tenantId/surveys", SurveyNetworkController.getTenantSurveys)
NetworkRouter.get("/tenant/:tenantId/survey/:surveyId/results", SurveyNetworkController.getTenantSurveyResults)
NetworkRouter.get("/stats", getSurveyStatisticsChain(), validateRequestSchema, StatisticsController.getSurveyStatistics)

export default NetworkRouter;