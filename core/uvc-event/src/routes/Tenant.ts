import { Router } from "express";
import * as EventController from "../controller/Event";
import * as EventRegistrationController from "../controller/EventRegistration";
import * as EventAttendeeController from "../controller/EventAttendee";
import { downloadFile, requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { createEventChain, deleteEventChain, getEventChain, updateEventChain } from "../controller/Event.validate";
import { deleteRegistrationChain } from "../controller/EventRegistration.validate";
import { deleteAttendeeChain } from "../controller/EventAttendee.validate";

const TenantRouter = Router({ mergeParams: true });

TenantRouter.get("/event", EventController.getEvents);
TenantRouter.get("/event/:eventId", getEventChain(), validateRequestSchema, EventController.getEvent);
TenantRouter.post("/event", requireTenantPermission('event:create', false), createEventChain(), validateRequestSchema, EventController.createEvent);
TenantRouter.put("/event/:eventId", requireTenantPermission('event:edit', true), uploader.fields([{ name: "newUploads", maxCount: 5 }, { name: "cover", maxCount: 1 }]), updateEventChain(), validateRequestSchema, EventController.updateEvent);
TenantRouter.delete("/event/:eventId", requireTenantPermission('event:delete', true), deleteEventChain(), validateRequestSchema, EventController.deleteEvent);
TenantRouter.get("/event/:eventId/download/:key", downloadFile) // Download Material
TenantRouter.delete("/event/:eventId/registration/:registrationId", requireTenantPermission('event:edit', true), deleteRegistrationChain(), validateRequestSchema, EventRegistrationController.deleteRegistration);
TenantRouter.delete("/event/:eventId/attendee/:attendeeId", requireTenantPermission('event:edit', true), deleteAttendeeChain(), validateRequestSchema, EventAttendeeController.deleteAttendee);

export default TenantRouter;