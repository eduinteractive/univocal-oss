import { Document, Model, Schema, Types, model } from "mongoose";

export enum ProfileObjectStatus {
    DRAFT = "DRAFT",
    EXAMINATION = "EXAMINATION",
    PUBLISHED = "PUBLISHED"
}

interface ProfileAttrs {
    tenantId: Types.ObjectId;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
    backgroundImage?: string;
}

interface ProfileModel extends Model<ProfileDoc> {
    build: (attrs: ProfileAttrs) => ProfileDoc;
}

export interface ProfileDoc extends Document {
    tenantId: Types.ObjectId;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: string;
    backgroundImage?: string;
}

const ProfileSchema = new Schema({
    tenantId: { type: Types.ObjectId, required: true },
    description: { type: String },
    contactPerson: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    contactWebsite: { type: String },
    publicPerson: { type: String },
    avatarImage: { type: String },
    backgroundImage: { type: String }
})

ProfileSchema.statics.build = (attrs: ProfileAttrs) => {
    return new Profile(attrs);
}

const Profile = model<ProfileDoc, ProfileModel>("Profile", ProfileSchema);

export default Profile;