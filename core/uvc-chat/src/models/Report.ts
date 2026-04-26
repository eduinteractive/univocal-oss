import { Document, model, Model, Types, Schema } from "mongoose";

export enum ReportStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
}

export enum ReportType {
    PRIVATE_MESSAGE = "PRIVATE_MESSAGE",
    GROUP_MESSAGE = "GROUP_MESSAGE",
}

export enum ReportAction {
    WARNING = "WARNING",
    BAN = "BAN",
    DELETE = "DELETE",
    OTHER = "OTHER",
}

interface ReportAttrs {
    messageId: Types.ObjectId;
    type: ReportType;
    status: ReportStatus;
    action?: ReportAction;
    reason?: string;
}

interface ReportModel extends Model<ReportDoc> {
    build: (attrs: ReportAttrs) => ReportDoc;
}

export interface ReportDoc extends Document {
    _id: Types.ObjectId;
    messageId: Types.ObjectId;
    type: ReportType;
    status: ReportStatus;
    action?: ReportAction;
    reason?: string;
    originalMessageContent?: string;
}

const ReportSchema = new Schema({
    messageId: { type: Types.ObjectId, required: true },
    type: { type: String, enum: Object.values(ReportType), required: true },
    status: { type: String, enum: Object.values(ReportStatus), required: true },
    action: { type: String, enum: Object.values(ReportAction), required: false, default: null },
    reason: { type: String, required: false, default: "" },
    originalMessageContent: { type: String, required: false },
}, { timestamps: true });

ReportSchema.statics.build = (attrs: ReportAttrs) => {
    return new Report(attrs);
}

const Report = model<ReportDoc, ReportModel>("Report", ReportSchema);

export default Report;