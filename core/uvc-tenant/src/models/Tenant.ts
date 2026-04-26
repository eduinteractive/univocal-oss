import { Document, Model, Schema, Types, model } from "mongoose";

export enum TenantVisibility {
    PUBLIC = "PUBLIC",
    HIDDEN = "HIDDEN",
    ON_REQUEST = "ON_REQUEST",
}

interface TenantAttrs {
    title: string;
    description?: string;
    domain: Types.ObjectId;
    visibility: TenantVisibility;
    integrations: {
        dashboard: boolean;
        documentation: boolean;
        calendar: boolean;
        survey: boolean;
        chat: boolean;
        budget: boolean;
        knowledge: boolean;
        event: boolean;
        project: boolean;
    }
}

interface TenantModel extends Model<TenantDoc> {
    build(attrs: TenantAttrs): TenantDoc;
}

export interface TenantDoc extends Document {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    domain: Types.ObjectId;
    visibility: TenantVisibility;
    integrations: {
        dashboard: boolean;
        documentation: boolean;
        calendar: boolean;
        survey: boolean;
        chat: boolean;
        budget: boolean;
        knowledge: boolean;
        event: boolean;
        project: boolean;
    }
}

const TenantSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    domain: { type: Types.ObjectId, ref: "Domain", required: true },
    visibility: {
        type: String,
        enum: Object.values(TenantVisibility),
        required: true,
        default: TenantVisibility.HIDDEN,
    },
    integrations: {
        dashboard: { type: Boolean, required: true, default: true },
        documentation: { type: Boolean, required: true, default: false },
        calendar: { type: Boolean, required: true, default: false },
        survey: { type: Boolean, required: true, default: false },
        chat: { type: Boolean, required: true, default: false },
        budget: { type: Boolean, required: true, default: false },
        knowledge: { type: Boolean, required: true, default: false },
        event: { type: Boolean, required: true, default: false },
        project: { type: Boolean, required: true, default: false },
    }
})

TenantSchema.statics.build = (attrs: TenantAttrs) => {
    return new Tenant(attrs);
}

const Tenant = model<TenantDoc, TenantModel>("Tenant", TenantSchema);

export default Tenant;
