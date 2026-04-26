import { Router } from "express";
import * as StatisticsController from "../controller/Statistics";
import { getCalendarStatisticsChain } from "../controller/Statistics.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const NetworkRouter = Router({ mergeParams: true });

NetworkRouter.get("/stats", getCalendarStatisticsChain(), validateRequestSchema, StatisticsController.getCalendarStatistics)

export default NetworkRouter;