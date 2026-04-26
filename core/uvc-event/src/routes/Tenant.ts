import { Router } from "express";
import * as EventController from "../controller/Event";
import { downloadFile, requireTenantPermission, uploader, validateRequestSchema } from "@eduinteractive/uvc-common";
import { createEventChain, deleteEventChain, getEventChain, updateEventChain } from "../controller/Event.validate";

const TenantRouter = Router({ mergeParams: true });

TenantRouter.get("/event", EventController.getEvents);
TenantRouter.get("/event/:eventId", getEventChain(), validateRequestSchema, EventController.getEvent);
TenantRouter.post("/event", requireTenantPermission('event:create', false), createEventChain(), validateRequestSchema, EventController.createEvent);
TenantRouter.put("/event/:eventId", requireTenantPermission('event:edit', true), uploader.array("newUploads", 5), updateEventChain(), validateRequestSchema, EventController.updateEvent);
TenantRouter.delete("/event/:eventId", requireTenantPermission('event:delete', true), deleteEventChain(), validateRequestSchema, EventController.deleteEvent);
TenantRouter.get("/event/:eventId/download/:key", downloadFile) // Download Material

export default TenantRouter;