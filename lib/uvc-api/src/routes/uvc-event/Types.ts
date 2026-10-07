import { SVHMetadata } from "../base";
import { SiteLayoutPreset } from "../uvc-profile/Types";

export const EVENT_ACCENTS = ["univocal", "campus-navy", "forest", "rose", "amber", "slate", "violet", "blue", "teal", "cyan", "grape", "orange", "pink"] as const;
export type EventAccent = (typeof EVENT_ACCENTS)[number];

export interface SVHEventSession {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    place?: string;
    description?: string;
}

export interface SVHEvent extends SVHMetadata {
    _id: string;
    startDate: Date;
    endDate?: Date;
    place?: {
        name: string;
        address: string;
    };
    config: {
        toc: {
            enabled: boolean;
            content: string;
            materials: {
                title: string;
                link: string;
                mimetype: string;
            }[]
            sessions?: SVHEventSession[];
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
            coverKey: string;
            accent: EventAccent;
            layout?: SiteLayoutPreset;
            published?: boolean;
        }
    }
}

export interface SVHPublicEvent {
    tenantId?: string;
    title: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    place?: {
        name: string;
        address: string;
    };
    spotsRemaining: number | null;
    config: SVHEvent["config"];
}

export interface SVHEventAttendee {
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

export interface SVHEventRegistration {
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