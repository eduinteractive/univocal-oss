import APIHandler, { createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from "./APIHandler";

export interface UVCEvent extends UVCMetadata {
    _id: string;
    startDate: Date;
    endDate?: Date;
    config: {
        toc: {
            enabled: boolean;
            content: string;
            materials: {
                title: string;
                link: string;
                mimetype: string;
            }[]
        }
        registration: {
            enabled: boolean;
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
        config?: {
            toc?: {
                enabled?: boolean;
                content?: string;
                materials?: {
                    title: string;
                    link: string;
                    mimetype: string;
                }[];
                newUploads?: File[];
            }
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
