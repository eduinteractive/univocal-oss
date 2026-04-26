import { Document, Model, Schema, Types, model } from "mongoose";

export enum TenantInvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
}

interface TenantInvitationAttrs {
    tenant: Types.ObjectId;
    mail: string;
    date: Date;
    status: TenantInvitationStatus;
    permissionLevel: number;
}

export interface TenantInvitationDoc extends Document {
    tenant: Types.ObjectId;
    mail: string;
    date: Date;
    status: TenantInvitationStatus;
    permissionLevel: number;
}

interface TenantInvitationModel extends Model<TenantInvitationDoc> {
    build(attrs: TenantInvitationAttrs): TenantInvitationDoc;
}

const tenantInvitationSchema = new Schema({
    tenant: {
        type: Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    mail: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(TenantInvitationStatus),
        required: true,
    },
    permissionLevel: {
        type: Number,
        required: true,
    }
});

tenantInvitationSchema.statics.build = (attrs: TenantInvitationAttrs) => {
    return new TenantInvitation(attrs);
}

const TenantInvitation = model<TenantInvitationDoc, TenantInvitationModel>('TenantInvitation', tenantInvitationSchema);

export default TenantInvitation;



