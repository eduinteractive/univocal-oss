import APIHandler, { BASE_URL, createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from "./APIHandler";

export interface UVCEventSession {
    id: string;
    title: string;
    start: Date | string;
    end?: Date | string;
    place?: string;
    description?: string;
}

export interface UVCEventPlace {
    name: string;
    address: string;
}

export const publicEventUrl = (eventId: string) => `${BASE_URL}/event/${eventId}`;

export interface UVCEvent extends UVCMetadata {
    _id: string;
    startDate: Date;
    endDate?: Date;
    place?: UVCEventPlace;
    config: {
        toc: {
            enabled: boolean;
            content: string;
            materials: {
                title: string;
                link: string;
                mimetype: string;
            }[]
            sessions?: UVCEventSession[];
        }
        registration: {
            enabled: boolean;
            capacity?: number | null;
            fields: {
                key: string;
                value: string;
            }[]
        },
        accreditation: {
            enabled: boolean;
            fields: {
                key: string;
                value: string;
            }[]
        }
        public?: {
            coverKey?: string;
            accent?: string;
            layout?: string;
            published?: boolean;
        }
    }
}

export interface UVCEventAttendee {
    _id: string;
    eventId: string;
    personal: {
        firstName: string;
        lastName: string;
        email: string;
    }
    customFields?: {
        [key: string]: unknown;
    }
    createdAt: Date;
    updatedAt: Date;
}

export interface UVCEventRegistration {
    _id: string;
    eventId: string;
    personal: {
        firstName: string;
        lastName: string;
        email: string;
    }
    customFields?: {
        [key: string]: unknown;
    }
    createdAt: Date;
    updatedAt: Date;
}

interface getEventsRequest {
    tenantId: string;
    params: UVCFilterObject | null;
}

export const getEvents = async (req: getEventsRequest): Promise<UVCEvent[]> => {
    const response = await APIHandler.get(`/event/tenant/${req.tenantId}/event`, { params: getUVCFilterParams(req.params) });
    return response.data;
}

interface getEventRequest {
    tenantId: string;
    eventId: string;
}

export const getEvent = async (req: getEventRequest) => {
    const response = await APIHandler.get(`/event/tenant/${req.tenantId}/event/${req.eventId}`);
    return response.data as {
        event: UVCEvent;
        attendees: UVCEventAttendee[];
        registrations: UVCEventRegistration[];
    };
}

interface getPublicEventRequest {
    eventId: string;
}

export const getPublicEvent = async (req: getPublicEventRequest) => {
    const response = await APIHandler.get(`/event/public/event/${req.eventId}`);
    return response.data as Partial<UVCEvent>;
}

interface createEventRequest {
    tenantId: string;
    body: createUVCMetadataAttrs & {
        startDate: Date;
        endDate?: Date;
        place?: UVCEventPlace;
    }
}

export const createEvent = async (req: createEventRequest): Promise<UVCEvent> => {
    return await APIHandler.post(`/event/tenant/${req.tenantId}/event`, req.body);
}

interface updateEventRequest {
    tenantId: string;
    eventId: string;
    body: updateUVCMetadataAttrs & {
        startDate?: Date;
        endDate?: Date;
        place?: UVCEventPlace;
        config?: {
            toc?: {
                enabled?: boolean;
                content?: string;
                materials?: {
                    title: string;
                    link: string;
                    mimetype: string;
                }[];
                sessions?: UVCEventSession[];
                newUploads?: File[];
            }
            registration?: {
                enabled?: boolean;
                capacity?: number | null;
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
            public?: {
                published?: boolean;
            }
        }
    }
}

export const updateEvent = async (req: updateEventRequest): Promise<UVCEvent> => {
    if (!req.body.config?.toc?.newUploads) {
        return await APIHandler.put(`/event/tenant/${req.tenantId}/event/${req.eventId}`, req.body);
    } else {
        const { newUploads, ...toc } = req.body.config.toc;
        const formData = new FormData();
        if (req.body.config.toc.newUploads) {
            newUploads.forEach(file => {
                formData.append('newUploads', file, file.name);
            });
        }
        formData.append('config', JSON.stringify({ toc }));
        return await APIHandler.put(`/event/tenant/${req.tenantId}/event/${req.eventId}`, formData,
            { headers: { 'Content-Type': 'multipart/form-data' } 
        });
    }
}

interface deleteEventRequest {
    tenantId: string;
    eventId: string;
}

export const deleteEvent = async (req: deleteEventRequest): Promise<void> => {
    await APIHandler.delete(`/event/tenant/${req.tenantId}/event/${req.eventId}`);
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

interface deleteEventRegistrationRequest {
    tenantId: string;
    eventId: string;
    registrationId: string;
}

export const deleteEventRegistration = async (req: deleteEventRegistrationRequest): Promise<void> => {
    await APIHandler.delete(`/event/tenant/${req.tenantId}/event/${req.eventId}/registration/${req.registrationId}`);
}

interface deleteEventAttendeeRequest {
    tenantId: string;
    eventId: string;
    attendeeId: string;
}

export const deleteEventAttendee = async (req: deleteEventAttendeeRequest): Promise<void> => {
    await APIHandler.delete(`/event/tenant/${req.tenantId}/event/${req.eventId}/attendee/${req.attendeeId}`);
}
