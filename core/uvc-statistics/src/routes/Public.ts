import { Router } from "express";
import * as PlatformStatistics from "../controller/PlatformStatistics";

const PublicRouter = Router({ mergeParams: true });

// Landing Page Analytics
PublicRouter.post("/platform/landing", PlatformStatistics.registerLandingPageCampaign);
PublicRouter.post("/platform/landing/event", PlatformStatistics.registerLandingEvent);

export default PublicRouter;
