import { APIHandler, getSVHFilterParams, SVHFilterObject } from "../base";
import { CalendarEvent } from "./Types";
import { CalendarToken } from "./Types";

interface getCalendarEventsRequest {
    tenantId: string;
    params: SVHFilterObject | null;
}

export const getCalendarEvents = async (req: getCalendarEventsRequest) => {
    const response = await APIHandler.get(`/calendar/tenant/${req.tenantId}/event`, { params: getSVHFilterParams(req.params) });
    return response.data as CalendarEvent[];
}

interface getCalendarEventRequest {
    eventId: string;
    tenantId: string;
}

export const getCalendarEvent = async (req: getCalendarEventRequest) => {
    if (!req.eventId || !req.tenantId) throw new Error('No Event id provided');
    const response = await APIHandler.get(`/calendar/tenant/${req.tenantId}/event/${req.eventId}`);
    return response.data as CalendarEvent;
}

interface createCalendarEventRequest {
    tenantId: string;
    title: string;
    description?: string;
    location?: string;
    notes?: string;
    startDate: Date;
    endDate: Date;
    color?: string;
    viewAccess: number;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
    newUploads?: File[]
}

export const createCalendarEvent = async (req: createCalendarEventRequest) => {
    if (!req.tenantId) throw new Error('No Tenant id provided');
    const formData = new FormData();
    formData.append('title', req.title);
    formData.append('startDate', req.startDate.toISOString());
    formData.append('endDate', req.endDate.toISOString());
    formData.append('viewAccess', req.viewAccess?.toString());
    formData.append('materials', JSON.stringify(req.materials));
    if (req.description !== undefined) formData.append('description', req.description);
    if (req.location !== undefined) formData.append('location', req.location);
    if (req.notes !== undefined) formData.append('notes', req.notes);
    if (req.color !== undefined) formData.append('color', req.color);
    if (req.newUploads) {
        req.newUploads.forEach(file => {
            formData.append('newUploads', file, file.name);
        });
    }
    const response = await APIHandler.post(`/calendar/tenant/${req.tenantId}/event`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as CalendarEvent;
}

interface updateCalendarEventRequest {
    eventId: string;
    tenantId: string;
    body: {
        title?: string;
        description?: string;
        location?: string;
        notes?: string;
        startDate?: Date;
        endDate?: Date;
        color?: string;
        viewAccess?: number;
        materials: {
            title: string,
            link: string,
            mimetype: string
        }[]
        newUploads?: File[]
    },
}

export const updateCalendarEvent = async (req: updateCalendarEventRequest) => {
    if (!req.eventId || !req.tenantId) throw new Error('No Event id provided');
    const formData = new FormData();
    if (req.body.title !== undefined) formData.append('title', req.body.title);
    if (req.body.description !== undefined) formData.append('description', req.body.description);
    if (req.body.location !== undefined) formData.append('location', req.body.location);
    if (req.body.notes !== undefined) formData.append('notes', req.body.notes);
    if (req.body.startDate !== undefined) formData.append('startDate', req.body.startDate?.toISOString());
    if (req.body.color !== undefined) formData.append('color', req.body.color);
    if (req.body.viewAccess !== undefined) formData.append('viewAccess', req.body.viewAccess.toString());
    if (req.body.endDate !== undefined) formData.append('endDate', req.body.endDate.toISOString());
    if (req.body.materials) formData.append('materials', JSON.stringify(req.body.materials));
    if (req.body.newUploads) {
        req.body.newUploads.forEach(file => {
            formData.append('newUploads', file, file.name);
        });
    }
    const response = await APIHandler.put(`/calendar/tenant/${req.tenantId}/event/${req.eventId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as CalendarEvent;
}

interface deleteCalendarEventRequest {
    eventId: string;
    tenantId: string;
}

export const deleteCalendarEvent = async (req: deleteCalendarEventRequest) => {
    if (!req.eventId || !req.tenantId) throw new Error('No Event id provided');
    const response = await APIHandler.delete(`/calendar/tenant/${req.tenantId}/event/${req.eventId}`);
    return response.data as CalendarEvent;
}

export const getCalendarToken = async (tenantId: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.get(`/calendar/tenant/${tenantId}/calendar`);
    return response.data as CalendarToken;
}

export const activateCalendar = async (tenantId: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.post(`/calendar/tenant/${tenantId}/calendar/activate`);
    return response.data as CalendarToken;
}

export const deactivateCalendar = async (tenantId: string) => {
    if (!tenantId) throw new Error('No Tenant id provided');
    const response = await APIHandler.post(`/calendar/tenant/${tenantId}/calendar/deactivate`);
    return response.data as CalendarToken;
}