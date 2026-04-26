import { NextFunction, Request, Response } from "express";
import CalendarEvent, { CalendarEventDoc } from "../models/CalendarEvent";
import { Types } from "mongoose";
import { ICalCalendar } from "ical-generator";
import CalendarToken, { CalendarTokenStatus } from "../models/CalendarToken";
import { ForbiddenError, hasReadPermission } from "@eduinteractive/uvc-common";

export const getCalendarEventsIcal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId, icalToken } = req.params as { tenantId: string, icalToken: string };
        const token = await CalendarToken.findOne({ tenantId: new Types.ObjectId(tenantId), token: icalToken });

        if (!token || token.status !== CalendarTokenStatus.ACTIVE) {
            throw new ForbiddenError("Du hast keinen Zugriff auf den Kalender");
        }

        const events = await CalendarEvent.find({ tenantId: new Types.ObjectId(tenantId), viewAccess: { $lte: token.viewAccess } });

        const calendar = new ICalCalendar({ name: "Kalender" });
        events.forEach(event => {
            calendar.createEvent({
                start: event.startDate,
                end: event.endDate,
                summary: event.title,
                description: event.description,
                location: event.location,
                id: event._id.toString(),
            });
        });

        res.writeHead(200, {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="calendar.ics"'
        });

        res.end(calendar.toString());
    } catch (err) {
        next(err);
    }
}

export const getCalendarEventIcal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventId, tenantId } = req.params as { eventId: string, tenantId: string };
        const event = await CalendarEvent.findById(eventId) as CalendarEventDoc;
        if (!hasReadPermission(event, tenantId, req.currentGroup!.permissionLevel)) {
            throw new ForbiddenError("Du hast keinen Zugriff auf den Kalender");
        }
        const calendar = new ICalCalendar({ name: "Kalender" });
        calendar.createEvent({
            start: event.startDate,
            end: event.endDate,
            summary: event.title,
            description: event.description,
            location: event.location,
            id: event._id.toString(),
        });

        res.writeHead(200, {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="event.ics"'
        });

        res.end(calendar.toString());
    } catch (err) {
        next(err);
    }
}

export const getCalendarToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const token = await CalendarToken.findOne({ tenantId: new Types.ObjectId(tenantId), viewAccess: req.currentGroup!.permissionLevel });
        if (!token) {
            throw new ForbiddenError("Du hast keinen Zugriff auf den Kalender");
        }
        res.status(200).json(token);
    } catch (err) {
        next(err);
    }
}

export const activateCalendarIcal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };

        const token = await CalendarToken.find({ tenantId: new Types.ObjectId(tenantId) });
        if (token) {
            for (const t of token) {
                t.status = CalendarTokenStatus.ACTIVE;
                await t.save();
            }
            res.status(200).json(token);
            return;
        }

        for (let i = 0; i < 6; i++) {
            const newtoken = CalendarToken.build({
                tenantId: new Types.ObjectId(tenantId),
                token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                status: CalendarTokenStatus.ACTIVE,
                viewAccess: i,
            });
            await newtoken.save();
        }

        res.status(201).json(token);
    } catch (err) {
        next(err);
    }
}

export const deactivateCalendarIcal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tenantId } = req.params as { tenantId: string };
        const token = await CalendarToken.find({ tenantId: new Types.ObjectId(tenantId) });
        for (const t of token) {
            if (!t) {
                throw new ForbiddenError("Du hast keinen Zugriff auf den Kalender");
            }
            t.status = CalendarTokenStatus.INACTIVE;
            await t.save();
        }
        res.status(200).json(token);
    } catch (err) {
        next(err);
    }
}