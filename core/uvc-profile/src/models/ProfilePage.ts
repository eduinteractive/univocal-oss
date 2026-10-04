import { Document, Model, Schema, Types, model } from "mongoose";
import { ProfileObjectStatus } from "./Profile";

interface ProfilePageAttrs {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    status: ProfileObjectStatus;
    publishDate?: Date;
}

interface ProfilePageModel extends Model<ProfilePageDoc> {
    build: (attrs: ProfilePageAttrs) => ProfilePageDoc;
}

export interface ProfilePageDoc extends Document {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    slug: string;
    content: string;
    status: ProfileObjectStatus;
    publishDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProfilePageSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    authorId: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    content: { type: String, default: "" },
    status: { type: String, required: true, enum: Object.values(ProfileObjectStatus), default: ProfileObjectStatus.DRAFT },
    publishDate: { type: Date },
}, { timestamps: true });

ProfilePageSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

ProfilePageSchema.statics.build = (attrs: ProfilePageAttrs) => {
    return new ProfilePage(attrs);
}

const ProfilePage = model<ProfilePageDoc, ProfilePageModel>("ProfilePage", ProfilePageSchema);

export default ProfilePage;
