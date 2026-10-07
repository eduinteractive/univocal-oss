import { Request, Response, NextFunction } from "express";
import EventAttendee from "../models/EventAttendee";
import { Types } from "mongoose";
import SVEvent, { SVEventDoc } from "../models/Event";
import { BadRequestError, ForbiddenError, hasReadPermission, NotFoundError } from "@eduinteractive/uvc-common";

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
        if (!event.config.accreditation.enabled || event.config.public?.published === false) {
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

export const deleteAttendee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId, attendeeId } = req.params as { eventId: string, tenantId: string, attendeeId: string };
        const event = await SVEvent.findById(eventId) as SVEventDoc;
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new NotFoundError("Das Event wurde nicht gefunden.");
        }
        if (!req.permission && !event.authorId.equals(req.currentUser!._id)) {
            throw new ForbiddenError("Du bist nicht berechtigt dieses Event zu bearbeiten!");
        }
        const attendee = await EventAttendee.findOne({
            _id: new Types.ObjectId(attendeeId),
            eventId: new Types.ObjectId(eventId),
        });
        if (!attendee) {
            throw new NotFoundError("Der Check-In wurde nicht gefunden.");
        }
        await attendee.deleteOne();
        res.status(200).json({ deleted: true });
    } catch (err) {
        next(err);
    }
}