/**
 * Event Routes
 */

import { APIHandler, createSVHMetadataAttrs, getSVHFilterParams, SVHFilterObject, updateSVHMetadataAttrs } from "../base";
import { SVHEvent, SVHEventAttendee, SVHEventRegistration } from "./Types";

interface getEventsRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getEvents = async (req: getEventsRequest): Promise<SVHEvent[]> => {
    const response = await APIHandler.get(`/event/tenant/${req.tenantId}/event`, { params: getSVHFilterParams(req.params) });
    return response.data;
}

interface getEventRequest {
    tenantId: string;
    eventId: string;
}

export const getEvent = async (req: getEventRequest) => {
    const response = await APIHandler.get(`/event/tenant/${req.tenantId}/event/${req.eventId}`);
    return response.data as {
        event: SVHEvent;
        attendees: SVHEventAttendee[];
        registrations: SVHEventRegistration[];
    };
}

interface createEventRequest {
    tenantId: string;
    body: createSVHMetadataAttrs & {
        startDate: Date;
        endDate?: Date;
    }
}

export const createEvent = async (req: createEventRequest): Promise<SVHEvent> => {
    return await APIHandler.post(`/event/tenant/${req.tenantId}/event`, req.body);
}

interface updateEventRequest {
    tenantId: string;
    eventId: string;
    body: updateSVHMetadataAttrs & {
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

export const updateEvent = async (req: updateEventRequest): Promise<SVHEvent> => {
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