import { Router } from "express";
import * as CalendarController from "../controller/Calendar";
import { getCalendarEventsIcalChain } from "../controller/Calendar.validate";
import { validateRequestSchema } from "@eduinteractive/uvc-common";

const PublicRouter = Router({ mergeParams: true });

PublicRouter.get("/tenant/:tenantId/calendar/:icalToken", getCalendarEventsIcalChain(), validateRequestSchema, CalendarController.getCalendarEventsIcal) // Get Event ICS

export default PublicRouter;