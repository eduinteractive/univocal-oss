import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Model, Schema, Types, model } from "mongoose";

export const EVENT_ACCENTS = ["univocal", "campus-navy", "forest", "rose", "amber", "slate", "violet", "blue", "teal", "cyan", "grape", "orange", "pink"] as const;
export type EventAccent = (typeof EVENT_ACCENTS)[number];
export const EVENT_LAYOUTS = ["compact", "magazine", "showcase"] as const;
export type EventLayout = (typeof EVENT_LAYOUTS)[number];

export interface SVEventSession {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    place?: string;
    description?: string;
}

export interface SVEventAttrs extends SVHMetadataAttrs {
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
            sessions: SVEventSession[];
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
        public: {
            coverKey: string;
            accent: EventAccent;
            layout?: EventLayout;
            published?: boolean;
        }
    }
}

interface SVEventModel extends Model<SVEventDoc> {
    build: (attrs: SVEventAttrs) => SVEventDoc;
}

export interface SVEventDoc extends SVHMetadataDoc {
    _id: Types.ObjectId;
    startDate: Date;
    endDate?: Date;
    place?: {
        name: string;
        address: string;
    };
    config: SVEventAttrs["config"];
}

const sessionSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    place: { type: String, default: "" },
    description: { type: String, default: "" },
}, { _id: false });

const SVEventSchema = new Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    place: {
        type: {
            name: { type: String, default: "" },
            address: { type: String, default: "" },
        },
        _id: false,
        default: { name: "", address: "" },
    },
    config: {
        type: {
            toc: {
                type: {
                    enabled: { type: Boolean, required: true },
                    content: { type: String, default: "" },
                    materials: {
                        type: [
                            {
                                title: { type: String, required: true },
                                link: { type: String, required: true },
                                mimetype: { type: String, required: true }
                            }
                        ],
                        default: []
                    },
                    sessions: {
                        type: [sessionSchema],
                        default: [],
                    },
                },
                _id: false
            },
            registration: {
                type: {
                    enabled: { type: Boolean, required: true },
                    capacity: { type: Number, default: null },
                    fields: {
                        type: [
                            {
                                key: { type: String, required: true },
                                value: { type: String, required: true }
                            }
                        ],
                        default: []
                    }
                },
                default: { fields: [], enabled: false, capacity: null },
                _id: false
            },
            accreditation: {
                type: {
                    enabled: { type: Boolean, required: true },
                    fields: {
                        type: [
                            {
                                key: { type: String, required: true },
                                value: { type: String, required: true }
                            }
                        ],
                        default: []
                    }
                },
                default: { fields: [], enabled: false },
                _id: false
            },
            public: {
                type: {
                    coverKey: { type: String, default: "" },
                    accent: { type: String, enum: EVENT_ACCENTS, default: "univocal" },
                    layout: { type: String, enum: EVENT_LAYOUTS, default: "compact" },
                    published: { type: Boolean, default: true },
                },
                default: { coverKey: "", accent: "univocal", layout: "compact" },
                _id: false,
            },
        },
        _id: false,
        default: { 
            registration: { fields: [], enabled: false, capacity: null }, 
            toc: { content: "", enabled: false, materials: [], sessions: [] }, 
            accreditation: { fields: [], enabled: false },
            public: { coverKey: "", accent: "univocal", layout: "compact", published: true },
        },
        required: true,
    }
});

SVEventSchema.add(SVHMetadataSchema)

SVEventSchema.statics.build = (attrs: SVEventAttrs) => {
    return new SVEvent(attrs);
};

const SVEvent = model<SVEventDoc, SVEventModel>("SVEvent", SVEventSchema);

export default SVEvent;
