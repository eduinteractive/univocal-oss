import { Document, Model, Schema, Types, model } from "mongoose";

export interface EventRegistrationAttrs {
    eventId: Types.ObjectId;
    personal: {
        firstName: string;
        lastName: string;
        email: string;
    }
    customFields?: {
        [key: string]: any;
    }
}

interface EventRegistrationModel extends Model<EventRegistrationDoc> {
    build: (attrs: EventRegistrationAttrs) => EventRegistrationDoc;
}

export interface EventRegistrationDoc extends Document {
    _id: Types.ObjectId;
    eventId: Types.ObjectId;
    personal: {
        firstName: string;
        lastName: string;
        email: string;
    }
    customFields?: {
        [key: string]: any;
    }
    createdAt: Date;
    updatedAt: Date;
}

const EventRegistrationSchema = new Schema({
    eventId: { type: Types.ObjectId, required: true },
    personal: {
        type: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true }
        },
        required: true,
        _id: false
    },
    customFields: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

EventRegistrationSchema.statics.build = (attrs: EventRegistrationAttrs) => {
    return new EventRegistration(attrs);
};

const EventRegistration = model<EventRegistrationDoc, EventRegistrationModel>("EventRegistration", EventRegistrationSchema);

export default EventRegistration;