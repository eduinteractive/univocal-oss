import { NextFunction, Request, Response } from "express";
import CalendarEvent, { CalendarEventDoc } from "../models/CalendarEvent";
import { Types } from "mongoose";
import { ForbiddenError, NotFoundError, createSVHMetadata, createSVHMetadataAttrs, deleteFile, hasReadPermission, readSVH, readSVHQuery, sendPushNotification, updateSVHMetadata, updateSVHMetadataAttrs, uploadFiles } from "@eduinteractive/uvc-common";

interface getCalendarEventsQuery extends readSVHQuery {}

export const getCalendarEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const query = req.query as getCalendarEventsQuery;
        const svhFilter = readSVH(query);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel } };

        const events = await CalendarEvent.find(condition).sort(svhFilter.sort);
        res.status(200).json(events);
    } catch (err) {
        next(err);
    }
}

export const getCalendarEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const event = await CalendarEvent.findById(eventId);
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Kalenderevent nicht gefunden!");
        }
        res.status(200).json(event);
    } catch (err) {
        next(err);
    }
}

interface createCalendarEventRequest extends createSVHMetadataAttrs {
    location?: string;
    notes?: string;
    startDate: Date;
    endDate: Date;
    color?: string;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
}

export const createCalendarEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createCalendarEventRequest;
        const calendarEventAttrs = createSVHMetadata(req, body);
        const calendarEvent = CalendarEvent.build({
            ...calendarEventAttrs,
            location: body.location !== undefined ? body.location : "",
            notes: body.notes !== undefined ? body.notes : "",
            startDate: body.startDate,
            endDate: body.endDate,
            color: body.color !== undefined ? body.color : "",
            materials: []
        });
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const fileData = await uploadFiles(tenantId + "/" + calendarEvent._id, req.files);
            calendarEvent.materials = fileData.map(file => ({
                title: file.fileName,
                link: file.url,
                mimetype: file.mimeType
            }));
        }
        await calendarEvent.save();
        res.status(201).json(calendarEvent);
        await sendPushNotification({
            title: "Neuer Termin",
            message: `Es wurde der Termin "${calendarEvent.title}" erstellt.`,
            groupId: tenantId,
            userId: req.currentUser!._id,
            permissionLevel: body.viewAccess
        }, req);
    } catch (err) {
        next(err);
    }
}

interface updateCalendarEventRequest extends updateSVHMetadataAttrs {
    location?: string;
    notes?: string;
    startDate?: Date;
    endDate?: Date;
    color?: string;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
}

export const updateCalendarEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const body = req.body as updateCalendarEventRequest;
        const calendarEvent = await CalendarEvent.findById(eventId) as CalendarEventDoc;
        if (!hasReadPermission(calendarEvent, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Kalenderevent nicht gefunden!");
        }
        if (!req.permission && !calendarEvent.authorId.equals(req.currentUser!._id)) {
            throw new ForbiddenError("Du bist nicht berechtigt diesen Termin zu bearbeiten!");
        }
        // Delete all materials that are not in the new materials array and in the S3 Storage
        if (body.materials) {
            const materialsToDelete = calendarEvent.materials.filter(material => !body.materials.some(newMaterial => newMaterial.link === material.link));
            materialsToDelete.forEach(async material => {
                await deleteFile(material.link);
            });
            calendarEvent.materials = body.materials;
            calendarEvent.markModified("materials");
        }
        updateSVHMetadata(calendarEvent, body);
        calendarEvent.location = body.location !== undefined ? body.location : calendarEvent.location;
        calendarEvent.startDate = body.startDate !== undefined ? body.startDate : calendarEvent.startDate;
        calendarEvent.endDate = body.endDate !== undefined ? body.endDate : calendarEvent.endDate;
        calendarEvent.notes = body.notes !== undefined ? body.notes : calendarEvent.notes;
        calendarEvent.color = body.color !== undefined ? body.color : calendarEvent.color;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const fileData = await uploadFiles(tenantId + "/" + calendarEvent._id, req.files);
            calendarEvent.materials = [
                ...body.materials,
                ...fileData.map(file => ({
                    title: file.fileName,
                    link: file.url,
                    mimetype: file.mimeType
                }))
            ];
            calendarEvent.markModified("materials");
        }
        await calendarEvent.save();
        res.status(200).json(calendarEvent);
        await sendPushNotification({
            title: "Termin aktualisiert",
            message: `Der Termin "${calendarEvent.title}" wurde aktualisiert.`,
            groupId: tenantId,
            userId: req.currentUser!._id,
            permissionLevel: body.viewAccess || calendarEvent.viewAccess
        }, req);
    } catch (err) {
        next(err);
    }
}

export const deleteCalendarEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const calendarEvent = await CalendarEvent.findById(eventId) as CalendarEventDoc;
        if (!hasReadPermission(calendarEvent, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Kalenderevent nicht gefunden!");
        }
        if (!req.permission && !calendarEvent.authorId.equals(req.currentUser!._id)) {
            throw new ForbiddenError("Du bist nicht berechtigt diesen Termin zu bearbeiten!");
        }
        calendarEvent.materials.forEach(async material => {
            await deleteFile(material.link);
        });
        await calendarEvent.deleteOne();
        res.status(204).send();
        await sendPushNotification({
            title: "Termin gelöscht",
            message: `Der Termin "${calendarEvent.title}" wurde gelöscht.`,
            groupId: tenantId,
            userId: req.currentUser!._id,
            permissionLevel: calendarEvent.viewAccess
        }, req);
    } catch (err) {
        next(err);
    }
}