import { Router } from "express";
import * as EventController from "../controller/Event";
import * as EventAttendeeController from "../controller/EventAttendee";
import * as EventRegistrationController from "../controller/EventRegistration";
import { downloadFile, validateRequestSchema } from "@eduinteractive/uvc-common";
import { createAttendeeChain } from "../controller/EventAttendee.validate";
import { createRegistrationChain } from "../controller/EventRegistration.validate";
import { getEventChain } from "../controller/Event.validate";

const PublicRouter = Router({ mergeParams: true });

PublicRouter.get("/event/:eventId", getEventChain(), validateRequestSchema, EventController.getPublicEvent);
PublicRouter.get("/event/:eventId/download/:key", downloadFile);
PublicRouter.post("/event/:eventId/attendee", createAttendeeChain(), validateRequestSchema, EventAttendeeController.createAttendee);
PublicRouter.post("/event/:eventId/registration", createRegistrationChain(), validateRequestSchema, EventRegistrationController.createRegistration);

export default PublicRouter;