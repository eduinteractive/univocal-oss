import { SVHMetadata } from "../base";

export interface SVHEvent extends SVHMetadata {
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