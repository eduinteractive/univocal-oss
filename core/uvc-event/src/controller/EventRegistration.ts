import { Request, Response, NextFunction } from "express";
import EventRegistration from "../models/EventRegistration";
import { Types } from "mongoose";
import SVEvent, { SVEventDoc } from "../models/Event";
import { BadRequestError, ForbiddenError, hasReadPermission, NotFoundError } from "@eduinteractive/uvc-common";

interface createRegistrationRequest {
    personal: {
        firstName: string;
        lastName: string;
        email: string;
    },
    customFields?: {
        [key: string]: any;
    }
}

export const createRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params as { eventId: string };
        const body: createRegistrationRequest = req.body;

        const event = await SVEvent.findById(eventId) as SVEventDoc;
        if (!event.config.registration.enabled || event.config.public?.published === false) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        const existingRegistration = await EventRegistration.findOne({ eventId: new Types.ObjectId(eventId), "personal.email": body.personal.email });
        if (existingRegistration) {
            throw new BadRequestError("Sie haben sich bereits für dieses Event registriert.");
        }
        if (typeof event.config.registration.capacity === "number") {
            const registrationCount = await EventRegistration.countDocuments({ eventId: event._id });
            if (registrationCount >= event.config.registration.capacity) {
                throw new BadRequestError("Die Veranstaltung ist ausgebucht.");
            }
        }

        const registration = EventRegistration.build({ eventId: new Types.ObjectId(eventId), ...body });
        await registration.save();
        res.status(201).json(registration);
    } catch (err) {
        next(err);
    }
}

export const deleteRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId, registrationId } = req.params as { eventId: string, tenantId: string, registrationId: string };
        const event = await SVEvent.findById(eventId) as SVEventDoc;
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        if (!req.permission && !event.authorId.equals(req.currentUser!._id)) {
            throw new ForbiddenError("Du bist nicht berechtigt dieses Event zu bearbeiten!");
        }
        const registration = await EventRegistration.findOne({
            _id: new Types.ObjectId(registrationId),
            eventId: new Types.ObjectId(eventId),
        });
        if (!registration) {
            throw new NotFoundError("Die Anmeldung wurde nicht gefunden.");
        }
        await registration.deleteOne();
        res.status(200).json({ deleted: true });
    } catch (err) {
        next(err);
    }
}