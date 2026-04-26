import { Document, Model, Schema, Types, model } from "mongoose";

export enum CalendarTokenStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export interface CalendarTokenAttrs {
    tenantId: Types.ObjectId;
    token: string;
    status: CalendarTokenStatus;
    viewAccess: number;
}

interface CalendarTokenModel extends Model<CalendarTokenDoc> {
    build: (attrs: CalendarTokenAttrs) => CalendarTokenDoc;
}

export interface CalendarTokenDoc extends Document {
    _id: Types.ObjectId;
    tenantId: Types.ObjectId;
    token: string;
    status: CalendarTokenStatus;
    viewAccess: number;
}

const CalendarTokenSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    token: { type: String, required: true },
    status: { type: String, enum: Object.values(CalendarTokenStatus), default: CalendarTokenStatus.ACTIVE },
    viewAccess: { type: Number, required: true, default: 0 }
})

CalendarTokenSchema.statics.build = (attrs: CalendarTokenAttrs) => {
    return new CalendarToken(attrs);
}

const CalendarToken = model<CalendarTokenDoc, CalendarTokenModel>("CalendarToken", CalendarTokenSchema);

export default CalendarToken;