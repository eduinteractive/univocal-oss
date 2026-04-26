import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Document, Model, Schema, Types, model } from "mongoose";

export interface CalendarEventAttrs extends SVHMetadataAttrs {
    location?: string;
    startDate: Date;
    endDate?: Date;
    notes?: string;
    color?: string;
    materials:
    {
        title: string,
        link: string,
        mimetype: string
    }[],
}

interface CalendarEventModel extends Model<CalendarEventDoc> {
    build: (attrs: CalendarEventAttrs) => CalendarEventDoc;
}

export interface CalendarEventDoc extends SVHMetadataDoc {
    _id: Types.ObjectId;
    location?: string;
    startDate: Date;
    endDate?: Date;
    notes?: string;
    color?: string;
    materials:
    {
        title: string,
        link: string,
        mimetype: string
    }[],
    createdAt: Date;
    updatedAt: Date;
}

const CalendarEventSchema = new Schema({
    location: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    notes: { type: String, default: "" },
    color: { type: String, default: "" },
    materials: {
        type: [
            {
                title: { type: String, required: true },
                link: { type: String, required: true },
                mimetype: { type: String, required: true }
            },
        ], default: [], required: true, _id: false
    }
})

CalendarEventSchema.add(SVHMetadataSchema);

CalendarEventSchema.statics.build = (attrs: CalendarEventAttrs) => {
    return new CalendarEvent(attrs);
}

const CalendarEvent = model<CalendarEventDoc, CalendarEventModel>("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;