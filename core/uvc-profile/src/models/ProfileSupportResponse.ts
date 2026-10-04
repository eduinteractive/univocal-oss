import { Document, Model, Schema, Types, model } from "mongoose";

export enum SupportResponseKind {
    OFFER = "OFFER",
    QUESTION = "QUESTION"
}

export enum SupportResponseStatus {
    OPEN = "OPEN",
    DONE = "DONE"
}

interface ProfileSupportResponseAttrs {
    tenantId: Types.ObjectId;
    requestId: Types.ObjectId;
    kind: SupportResponseKind;
    name?: string;
    email?: string;
    message: string;
    status: SupportResponseStatus;
}

interface ProfileSupportResponseModel extends Model<ProfileSupportResponseDoc> {
    build: (attrs: ProfileSupportResponseAttrs) => ProfileSupportResponseDoc;
}

export interface ProfileSupportResponseDoc extends Document {
    tenantId: Types.ObjectId;
    requestId: Types.ObjectId;
    kind: SupportResponseKind;
    name?: string;
    email?: string;
    message: string;
    status: SupportResponseStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSupportResponseSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true, index: true },
    requestId: { type: Types.ObjectId, required: true, index: true },
    kind: { type: String, required: true, enum: Object.values(SupportResponseKind) },
    name: { type: String },
    email: { type: String },
    message: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(SupportResponseStatus), default: SupportResponseStatus.OPEN },
}, { timestamps: true });

ProfileSupportResponseSchema.statics.build = (attrs: ProfileSupportResponseAttrs) => {
    return new ProfileSupportResponse(attrs);
}

const ProfileSupportResponse = model<ProfileSupportResponseDoc, ProfileSupportResponseModel>("ProfileSupportResponse", ProfileSupportResponseSchema);

export default ProfileSupportResponse;
