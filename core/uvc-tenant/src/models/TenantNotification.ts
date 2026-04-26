import { Document, Model, Schema, Types, model } from "mongoose";

export enum TenantNotificationType {
    INFO = "INFO",
}

interface TenantNotificationAttrs {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    type: TenantNotificationType;
    content: string;
    creationDate: Date;
    seenBy: Types.ObjectId[];
}

interface TenantNotificationModel extends Model<TenantNotificationDoc> {
    build(attrs: TenantNotificationAttrs): TenantNotificationDoc;
}

export interface TenantNotificationDoc extends Document {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    type: TenantNotificationType;
    content: string;
    creationDate: Date;
    seenBy: Types.ObjectId[];
}

const TenantNotificationSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true, ref: "Tenant"},
    authorId: { type: Types.ObjectId, required: true },
    type: { type: String, required: true, enum: Object.values(TenantNotificationType) },
    content: { type: String, required: true },
    creationDate: { type: Date, required: true },
    seenBy: { type: [Types.ObjectId], required: true, default: [] },
})

TenantNotificationSchema.statics.build = (attrs: TenantNotificationAttrs) => {
    return new TenantNotification(attrs);
}

const TenantNotification = model<TenantNotificationDoc, TenantNotificationModel>("TenantNotification", TenantNotificationSchema);

export default TenantNotification