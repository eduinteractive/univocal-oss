import { Router } from "express";
import * as SurveyMetaController from "../controller/SurveyMeta";
import * as SurveyComponentController from "../controller/SurveyComponent";
import * as SurveyResultController from "../controller/SurveyResult";
import { requireTenantPermission, validateRequestSchema } from "@eduinteractive/uvc-common";
import { isAuthor } from "../middlewares/isAuthor";
import { createSurveyChain, deleteSurveyChain, generateSurveyCodesChain, getSurveyChain, resetSurveyCodesChain, updateSurveyChain } from "../controller/SurveyMeta.validate";
import { createSurveyComponentChain, deleteSurveyComponentChain, updateSurveyComponentChain, updateSurveyComponentOrderChain } from "../controller/SurveyComponent.validate";
import { deleteSurveyResultChain, deleteSurveyResultsChain, getSurveyResultsChain } from "../controller/SurveyResult.validate";

const TenantRouter = Router({ mergeParams: true });

// Survey Meta Routes
TenantRouter.get("/survey", SurveyMetaController.getSurveys);
TenantRouter.get("/survey/:surveyId", getSurveyChain(), validateRequestSchema, SurveyMetaController.getSurvey);
TenantRouter.post("/survey", requireTenantPermission('survey:create', false), createSurveyChain(), validateRequestSchema, SurveyMetaController.createSurvey);
TenantRouter.put("/survey/:surveyId", requireTenantPermission('survey:edit', true), isAuthor, updateSurveyChain(), validateRequestSchema, SurveyMetaController.updateSurvey);
TenantRouter.delete("/survey/:surveyId", requireTenantPermission('survey:delete', true), isAuthor, deleteSurveyChain(), validateRequestSchema, SurveyMetaController.deleteSurvey);
TenantRouter.put("/survey/:surveyId/gencodes", requireTenantPermission('survey:edit', true), isAuthor, generateSurveyCodesChain(), validateRequestSchema, SurveyMetaController.generateSurveyCodes);
TenantRouter.put("/survey/:surveyId/rescodes", requireTenantPermission('survey:edit', true), isAuthor, resetSurveyCodesChain(), validateRequestSchema, SurveyMetaController.resetSurveyCodes);

// Survey Component Routes
TenantRouter.post("/survey/:surveyId/component", requireTenantPermission('survey:edit', true), isAuthor, createSurveyComponentChain(), validateRequestSchema, SurveyComponentController.createSurveyComponent);
TenantRouter.put("/survey/:surveyId/component/:componentId", requireTenantPermission('survey:edit', true), isAuthor, updateSurveyComponentChain(), validateRequestSchema, SurveyComponentController.updateSurveyComponent);
TenantRouter.put("/survey/:surveyId/component/:componentId/order", requireTenantPermission('survey:edit', true), isAuthor, updateSurveyComponentOrderChain(), validateRequestSchema, SurveyComponentController.updateSurveyComponentOrder);
TenantRouter.delete("/survey/:surveyId/component/:componentId", requireTenantPermission('survey:edit', true), isAuthor, deleteSurveyComponentChain(), validateRequestSchema, SurveyComponentController.deleteSurveyComponent);

// Survey Result Routes
TenantRouter.get("/survey/:surveyId/result", getSurveyResultsChain(), validateRequestSchema, SurveyResultController.getSurveyResults);
TenantRouter.delete("/survey/:surveyId/result/:resultId", requireTenantPermission('survey:edit', true), isAuthor, deleteSurveyResultChain(), validateRequestSchema, SurveyResultController.deleteSurveyResult);
TenantRouter.delete("/survey/:surveyId/result", requireTenantPermission('survey:edit', true), isAuthor, deleteSurveyResultsChain(), validateRequestSchema, SurveyResultController.deleteSurveyResults);

export default TenantRouter;