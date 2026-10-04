import { Document, Model, Schema, Types, model } from "mongoose";

export enum SupportRequestStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    CLOSED = "CLOSED"
}

interface ProfileSupportRequestAttrs {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    description: string;
    status: SupportRequestStatus;
    publishDate?: Date;
}

interface ProfileSupportRequestModel extends Model<ProfileSupportRequestDoc> {
    build: (attrs: ProfileSupportRequestAttrs) => ProfileSupportRequestDoc;
}

export interface ProfileSupportRequestDoc extends Document {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    description: string;
    status: SupportRequestStatus;
    publishDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSupportRequestSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    authorId: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, required: true, enum: Object.values(SupportRequestStatus), default: SupportRequestStatus.DRAFT },
    publishDate: { type: Date },
}, { timestamps: true });

ProfileSupportRequestSchema.statics.build = (attrs: ProfileSupportRequestAttrs) => {
    return new ProfileSupportRequest(attrs);
}

const ProfileSupportRequest = model<ProfileSupportRequestDoc, ProfileSupportRequestModel>("ProfileSupportRequest", ProfileSupportRequestSchema);

export default ProfileSupportRequest;
