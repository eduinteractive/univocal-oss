import { Router } from "express";
import * as SurveyPublicController from "../controller/SurveyPublic";
import { createSurveyResultChain } from "../controller/SurveyPublic.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";
import { getSurveyChain } from "../controller/SurveyMeta.validate";

const PublicRouter = Router({ mergeParams: true });

PublicRouter.get("/survey/:surveyId", getSurveyChain(), validateRequestSchema, SurveyPublicController.getSurvey);
PublicRouter.post("/survey/:surveyId/result", createSurveyResultChain(), validateRequestSchema, SurveyPublicController.createSurveyResult);

export default PublicRouter;