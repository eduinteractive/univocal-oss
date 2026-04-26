import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Document, Model, Schema, Types, model } from "mongoose";

export interface SVEventAttrs extends SVHMetadataAttrs {
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

interface SVEventModel extends Model<SVEventDoc> {
    build: (attrs: SVEventAttrs) => SVEventDoc;
}

export interface SVEventDoc extends SVHMetadataDoc {
    _id: Types.ObjectId;
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

const SVEventSchema = new Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date },
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
                    }
                },
                _id: false
            },
            registration: {
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
                default: { fields: [] },
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
                default: { fields: [] },
                _id: false
            }
        },
        _id: false,
        default: { 
            registration: { fields: [], enabled: false }, 
            toc: { content: "", enabled: false, materials: [] }, 
            accreditation: { fields: [], enabled: false } 
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