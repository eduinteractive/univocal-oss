import { Router } from "express";
import * as PublicController from "../controller/Public";
import { getNewsChain } from "../controller/News.validate";
import { getProjectChain } from "../controller/Project.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common/build/middlewares/validateRequest";
import { getProfileChain } from "../controller/Profile.validate";
import * as PublicSiteController from "../controller/PublicSite";
import {
    createPublicSupportResponseChain,
    publicPageChain,
    publicSupportRequestChain,
    publicSurveyResultsChain,
    subdomainParamChain,
} from "../controller/Site.validate";
import { rateLimit } from "../utils/RateLimit";

const PublicRouter = Router({ mergeParams: true });

const responseLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });

PublicRouter.get("/site/:subdomain", subdomainParamChain(), validateRequestSchema, PublicSiteController.getPublicSite);
PublicRouter.get("/site/:subdomain/pages/:slug", publicPageChain(), validateRequestSchema, PublicSiteController.getPublicSitePage);
PublicRouter.get("/site/:subdomain/support/:requestId", publicSupportRequestChain(), validateRequestSchema, PublicSiteController.getPublicSupportRequest);
PublicRouter.post("/site/:subdomain/support/:requestId/responses", responseLimiter, createPublicSupportResponseChain(), validateRequestSchema, PublicSiteController.createPublicSupportResponse);
PublicRouter.get("/site/:subdomain/surveys/:surveyId/results", publicSurveyResultsChain(), validateRequestSchema, PublicSiteController.getPublicSurveyResults);

PublicRouter.get("/news", PublicController.getAllPublicNews);
PublicRouter.get("/news/:newsId", getNewsChain(), validateRequestSchema, PublicController.getSinglePublicNews);
PublicRouter.get("/projects", PublicController.getAllPublicProjects);
PublicRouter.get("/projects/:projectId", getProjectChain(), validateRequestSchema, PublicController.getSinglePublicProject);
PublicRouter.get("/profile", PublicController.getPublicProfiles);
PublicRouter.get("/profile/:tenantId", getProfileChain(), validateRequestSchema, PublicController.getPublicProfile);
PublicRouter.get("/dashboard", PublicController.getDashboard);

export default PublicRouter;