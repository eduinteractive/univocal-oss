import { Request, Response, NextFunction } from "express";
import SVEvent, { SVEventDoc } from "../models/Event";
import { Types } from "mongoose";
import EventAttendee from "../models/EventAttendee";
import EventRegistration from "../models/EventRegistration";
import { createSVHMetadata, createSVHMetadataAttrs, deleteFile, ForbiddenError, hasReadPermission, NotFoundError, readSVH, readSVHQuery, updateSVHMetadata, updateSVHMetadataAttrs, uploadFiles } from "@eduinteractive/uvc-common";

interface getEventsQuery extends readSVHQuery {}

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const svhFilter = readSVH(req.query as getEventsQuery);

        const condition = { ...svhFilter.condition, tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: req.currentGroup!.permissionLevel } };
        const events = await SVEvent.find(condition).sort(svhFilter.sort);
        res.status(200).json(events);
    } catch (err) {
        next(err);
    }
}

export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const event = await SVEvent.findById(eventId);
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        const attendees = await EventAttendee.find({ eventId: new Types.ObjectId(eventId) });
        const registrations = await EventRegistration.find({ eventId: new Types.ObjectId(eventId) });
        res.status(200).json({ event, attendees, registrations });
    } catch (err) {
        next(err);
    }
}

export const getPublicEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params as { eventId: string };
        const event = await SVEvent.findById(eventId);
        if (!event) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        res.status(200).json({
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            config: {
                registration: event.config.registration,
                accreditation: event.config.accreditation,
                toc: {
                    enabled: event.config.toc.enabled,
                    content: event.config.toc.enabled ? event.config.toc.content : undefined,
                    materials: event.config.toc.enabled ? event.config.toc.materials : undefined
                }
            }
        });
    } catch (err) {
        next(err);
    }
}

interface createEventRequest extends createSVHMetadataAttrs {
    startDate: Date;
    endDate?: Date;
}

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const body = req.body as createEventRequest;
        const eventAttrs = createSVHMetadata(req, body);

        const event = SVEvent.build({
            ...eventAttrs,
            startDate: body.startDate,
            endDate: body.endDate,
            config: {
                toc: {
                    enabled: false,
                    content: "",
                    materials: []
                },
                registration: {
                    enabled: false,
                    fields: []
                },
                accreditation: {
                    enabled: false,
                    fields: []
                }
            }
        });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        next(err);
    }
}

interface updateEventRequest extends updateSVHMetadataAttrs {
    startDate?: Date;
    endDate?: Date;
    config?: {
        toc?: {
            enabled?: boolean;
            content?: string;
            materials?: {
                title: string;
                link: string;
                mimetype: string;
            }[]
        };
        registration?: {
            enabled?: boolean;
            fields?: {
                key: string;
                value: string;
            }[]
        },
        accreditation?: {
            enabled?: boolean;
            fields?: {
                key: string;
                value: string;
            }[]
        }
    }
}

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: updateEventRequest = {
            ...req.body,
            config: req.body.config && typeof req.body.config === "string" ? JSON.parse(req.body.config) : req.body.config
        };
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const event = await SVEvent.findById(eventId) as SVEventDoc;
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        if (!req.permission && !event.authorId.equals(req.currentUser!._id)) {
            throw new ForbiddenError("Du bist nicht berechtigt dieses Event zu bearbeiten!");
        }
        updateSVHMetadata(event, body);
        event.startDate = body.startDate !== undefined ? body.startDate : event.startDate;
        event.endDate = body.endDate !== undefined ? body.endDate : event.endDate;
        if (body.config !== undefined) {
            if (body.config.toc !== undefined) {
                if (body.config.toc.enabled !== undefined) event.config.toc.enabled = body.config.toc.enabled;
                if (body.config.toc.content !== undefined) event.config.toc.content = body.config.toc.content;
                if (body.config.toc.materials !== undefined) {
                    const materialsToDelete = event.config.toc.materials.filter(material => !body.config!.toc!.materials?.some(newMaterial => newMaterial.link === material.link));
                    for (const material of materialsToDelete) {
                        await deleteFile(material.link);
                    };
        
                    event.config.toc.materials = body.config.toc.materials;
        
                    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                        const fileData = await uploadFiles(tenantId + "/" + event._id, req.files);
                        event.config.toc.materials = [
                            ...body.config.toc.materials,
                            ...fileData.map(file => ({
                                title: file.fileName,
                                link: file.url,
                                mimetype: file.mimeType
                            }))
                        ]
                        event.markModified("config");
                    }
                }
            }
            if (body.config.registration !== undefined) {
                if (body.config.registration.enabled !== undefined) event.config.registration.enabled = body.config.registration.enabled;
                if (body.config.registration.fields !== undefined) event.config.registration.fields = body.config.registration.fields;
            }
            if (body.config.accreditation !== undefined) {
                if (body.config.accreditation.enabled !== undefined) event.config.accreditation.enabled = body.config.accreditation.enabled;
                if (body.config.accreditation.fields !== undefined) event.config.accreditation.fields = body.config.accreditation.fields;
            }
        }
        await event.save();
        res.status(200).json(event);
    } catch (err) {
        next(err);
    }
}

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const event = await SVEvent.findById(eventId) as SVEventDoc;
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        if (!req.permission && !event.authorId.equals(req.currentUser!._id)) {
            throw new ForbiddenError("Du bist nicht berechtigt dieses Event zu bearbeiten!");
        }
        await EventAttendee.deleteMany({ eventId: new Types.ObjectId(eventId) });
        await EventRegistration.deleteMany({ eventId: new Types.ObjectId(eventId) });
        await event.deleteOne();
        res.status(204).json();
    } catch (err) {
        next(err);
    }
}

export const resetEventsACL = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const events = await SVEvent.find({ tenantId: new Types.ObjectId(tenantId) });
        
        for (const event of events) {
            event.authorId = new Types.ObjectId();
            await event.save();
        }

        res.status(200).send("Success")
    } catch (err) {
        next(err);
    }
}