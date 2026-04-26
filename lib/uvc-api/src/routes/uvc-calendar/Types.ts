import { SVHMetadata } from "../base";

export enum CalendarTokenStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export interface CalendarEvent extends SVHMetadata {
    _id: string;
    location?: string;
    notes?: string;
    startDate: Date;
    endDate?: Date;
    color?: string;
    materials: {
        title: string,
        link: string,
        mimetype: string
    }[],
}

export interface CalendarToken {
    _id: string;
    tenantId: string;
    token: string;
    status: CalendarTokenStatus
}