/**
 * Event Routes
 */

import { APIHandler, createSVHMetadataAttrs, getSVHFilterParams, SVHFilterObject, updateSVHMetadataAttrs } from "../base";
import { SiteLayoutPreset } from "../uvc-profile/Types";
import { EventAccent, SVHEvent, SVHEventAttendee, SVHEventRegistration, SVHEventSession } from "./Types";

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
        place?: {
            name?: string;
            address?: string;
        };
        config?: {
            toc?: {
                enabled?: boolean;
                content?: string;
                materials?: {
                    title: string;
                    link: string;
                    mimetype: string;
                }[];
                sessions?: SVHEventSession[];
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
                coverKey?: string | null;
                accent?: EventAccent;
                layout?: SiteLayoutPreset;
                published?: boolean;
                coverFile?: File;
            }
        }
    }
}

export const updateEvent = async (req: updateEventRequest): Promise<SVHEvent> => {
    const newUploads = req.body.config?.toc?.newUploads;
    const coverFile = req.body.config?.public?.coverFile;
    if (!newUploads && !coverFile) {
        return await APIHandler.put(`/event/tenant/${req.tenantId}/event/${req.eventId}`, req.body);
    }
    const formData = new FormData();
    if (newUploads) {
        newUploads.forEach(file => {
            formData.append('newUploads', file, file.name);
        });
    }
    if (coverFile) {
        formData.append('cover', coverFile, coverFile.name);
    }
    const { config, ...rest } = req.body;
    const publicConfig = config?.public
        ? { coverKey: config.public.coverKey, accent: config.public.accent, layout: config.public.layout, published: config.public.published }
        : undefined;
    const toc = config?.toc
        ? { ...config.toc, newUploads: undefined }
        : undefined;
    formData.append('config', JSON.stringify({
        ...config,
        toc,
        public: publicConfig,
    }));
    Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
    });
    return await APIHandler.put(`/event/tenant/${req.tenantId}/event/${req.eventId}`, formData,
        { headers: { 'Content-Type': 'multipart/form-data' }
    });
}

interface deleteEventRequest {
    tenantId: string;
    eventId: string;
}

export const deleteEvent = async (req: deleteEventRequest): Promise<void> => {
    await APIHandler.delete(`/event/tenant/${req.tenantId}/event/${req.eventId}`);
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