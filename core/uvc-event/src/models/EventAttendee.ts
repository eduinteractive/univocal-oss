import { Document, Model, Schema, Types, model } from "mongoose";

export interface EventAttendeeAttrs {
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

interface EventAttendeeModel extends Model<EventAttendeeDoc> {
    build: (attrs: EventAttendeeAttrs) => EventAttendeeDoc;
}

export interface EventAttendeeDoc extends Document {
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
}

const EventAttendeeSchema = new Schema({
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
});

EventAttendeeSchema.statics.build = (attrs: EventAttendeeAttrs) => {
    return new EventAttendee(attrs);
};

const EventAttendee = model<EventAttendeeDoc, EventAttendeeModel>("EventAttendee", EventAttendeeSchema);

export default EventAttendee;