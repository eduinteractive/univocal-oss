import { Router } from "express";
import * as CalendarEventController from "../controller/CalendarEvent";
import * as CalendarController from "../controller/Calendar";
import { downloadFile, requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { activateCalendarIcalChain, deactivateCalendarIcalChain } from "../controller/Calendar.validate";
import { createCalendarEventChain, deleteCalendarEventChain, getCalendarEventChain, getCalendarEventIcalChain, updateCalendarEventChain } from "../controller/CalendarEvent.validate";

const TenantRouter = Router({ mergeParams: true });

// Calendar Routes
TenantRouter.get("/event", CalendarEventController.getCalendarEvents) // Get Events
TenantRouter.get("/event/:eventId", getCalendarEventChain(), validateRequestSchema, CalendarEventController.getCalendarEvent) // Get Event
TenantRouter.post("/event", requireTenantPermission('calendar:create', false), uploader.array("newUploads", 5), createCalendarEventChain(), validateRequestSchema, CalendarEventController.createCalendarEvent) // Create Events
TenantRouter.put("/event/:eventId", requireTenantPermission('calendar:edit', true), uploader.array("newUploads", 5), updateCalendarEventChain(), validateRequestSchema, CalendarEventController.updateCalendarEvent) // Update Event
TenantRouter.get("/event/:eventId/download/:key", downloadFile) // Download Material
TenantRouter.delete("/event/:eventId", requireTenantPermission('calendar:delete', true), deleteCalendarEventChain(), validateRequestSchema, CalendarEventController.deleteCalendarEvent) // Delete Event

TenantRouter.get("/calendar", CalendarController.getCalendarToken);
TenantRouter.get("/calendar/:eventId", getCalendarEventIcalChain(), validateRequestSchema, CalendarController.getCalendarEventIcal);
TenantRouter.post("/calendar/activate", requireTenantPermission('tenant:administration', false), activateCalendarIcalChain(), validateRequestSchema, CalendarController.activateCalendarIcal);
TenantRouter.post("/calendar/deactivate", requireTenantPermission('tenant:administration', false), deactivateCalendarIcalChain(), validateRequestSchema, CalendarController.deactivateCalendarIcal);


export default TenantRouter;