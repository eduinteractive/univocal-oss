import { Request, Response, NextFunction } from "express";
import EventRegistration from "../models/EventRegistration";
import { Types } from "mongoose";
import SVEvent, { SVEventDoc } from "../models/Event";
import { BadRequestError, hasReadPermission, NotFoundError } from "@eduinteractive/uvc-common";

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
        if (!event.config.registration.enabled) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        const existingRegistration = await EventRegistration.findOne({ eventId: new Types.ObjectId(eventId), "personal.email": body.personal.email });
        if (existingRegistration) {
            throw new BadRequestError("Sie haben sich bereits für dieses Event registriert.");
        }

        const registration = EventRegistration.build({ eventId: new Types.ObjectId(eventId), ...body });
        await registration.save();
        res.status(201).json(registration);
    } catch (err) {
        next(err);
    }
}