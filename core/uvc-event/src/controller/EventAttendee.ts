import { Request, Response, NextFunction } from "express";
import EventAttendee from "../models/EventAttendee";
import { Types } from "mongoose";
import SVEvent, { SVEventDoc } from "../models/Event";
import { BadRequestError, hasReadPermission, NotFoundError } from "@eduinteractive/uvc-common";

interface createAttendeeRequest {
    personal: {
        firstName: string;
        lastName: string;
        email: string;
    },
    customFields?: {
        [key: string]: any;
    }
}

export const createAttendee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.params as { eventId: string };
        const body: createAttendeeRequest = req.body;

        const event = await SVEvent.findById(eventId) as SVEventDoc;
        if (!event.config.accreditation.enabled) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }

        const existingAttendee = await EventAttendee.findOne({ eventId: new Types.ObjectId(eventId), "personal.email": body.personal.email });
        if (existingAttendee) {
            throw new BadRequestError("Sie haben sich bereits für dieses Event den Check-In durchgeführt.");
        }

        const attendee = EventAttendee.build({ eventId: new Types.ObjectId(eventId), ...body });
        await attendee.save();
        res.status(201).json(attendee);
    } catch (err) {
        next(err);
    }
}