import { APIHandler } from "../base";
import { SVHEvent } from "./Types";

interface getPublicEventRequest {
    eventId: string;
}

export const getPublicEvent = async (req: getPublicEventRequest) => {
    const response = await APIHandler.get(`/event/public/event/${req.eventId}`);
    return response.data as Partial<SVHEvent>;
}

interface createRegistrationRequest {
    eventId: string;
    body: {
        personal: {
            firstName: string;
            lastName: string;
            email: string;
        },
        customFields?: {
            [key: string]: unknown;
        }
    }
}



export const createEventRegistration = async (req: createRegistrationRequest) => {
    return await APIHandler.post(`/event/public/event/${req.eventId}/registration`, req.body);
}

interface createAttendeeRequest {
    eventId: string;
    body: {
        personal: {
            firstName: string;
            lastName: string;
            email: string;
        },
        customFields?: {
            [key: string]: unknown;
        }
    }
}

export const createEventAttendee = async (req: createAttendeeRequest) => {
    return await APIHandler.post(`/event/public/event/${req.eventId}/attendee`, req.body);
}