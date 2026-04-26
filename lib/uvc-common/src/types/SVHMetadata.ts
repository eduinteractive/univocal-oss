import { Document, Schema, Types } from 'mongoose';

export interface SVHMetadataAttrs {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    description?: string;
    viewAccess: number;
}

export interface SVHMetadataDoc extends Document {
    tenantId: Types.ObjectId;
    authorId: Types.ObjectId;
    title: string;
    description: string;
    viewAccess: number;
    createdAt: Date;
    updatedAt: Date;
}

export const SVHMetadataSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    viewAccess: { type: Number, required: true, default: 0 },
    tenantId: { type: Types.ObjectId, required: true },
    authorId: { type: Types.ObjectId, required: true },
}, { timestamps: true });

