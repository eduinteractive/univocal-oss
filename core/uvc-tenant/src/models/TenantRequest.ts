import { Document, Model, Schema, Types, model } from "mongoose";

export enum TenantRequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
}

interface TenantRequestAttrs {
    tenant: Types.ObjectId;
    requesterId: Types.ObjectId;
    mail: string;
    date: Date;
    status: TenantRequestStatus;
}

export interface TenantRequestDoc extends Document {
    tenant: Types.ObjectId;
    requesterId: Types.ObjectId;
    mail: string;
    date: Date;
    status: TenantRequestStatus;
}

interface TenantRequestModel extends Model<TenantRequestDoc> {
    build(attrs: TenantRequestAttrs): TenantRequestDoc;
}

const tenantRequestSchema = new Schema({
    tenant: {
        type: Types.ObjectId,
        ref: "Tenant",
        required: true,
    },
    requesterId: {
        type: Types.ObjectId,
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
        enum: Object.values(TenantRequestStatus),
        required: true,
    },
});

tenantRequestSchema.index(
    { tenant: 1, requesterId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: TenantRequestStatus.PENDING },
    }
);

tenantRequestSchema.statics.build = (attrs: TenantRequestAttrs) => {
    return new TenantRequest(attrs);
};

const TenantRequest = model<TenantRequestDoc, TenantRequestModel>(
    "TenantRequest",
    tenantRequestSchema
);

export default TenantRequest;
