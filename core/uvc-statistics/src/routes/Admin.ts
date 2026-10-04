import { Router } from "express";
import { validateRequestSchema } from "@eduinteractive/uvc-common";
import * as PlatformStatistics from "../controller/PlatformStatistics";
import { getLandingCampaignChain, getLandingSummaryChain } from "../controller/PlatformStatistics.validate";

const AdminRouter = Router({ mergeParams: true });

// Landing Page Analytics
AdminRouter.get("/platform/landing", getLandingCampaignChain(), validateRequestSchema, PlatformStatistics.getLandingPageCampaignStatistics);
AdminRouter.get("/platform/landing/summary", getLandingSummaryChain(), validateRequestSchema, PlatformStatistics.getLandingSummary);

export default AdminRouter;
