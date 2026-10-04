import mongoose, { Document, Model, Schema } from "mongoose";

export const LANDING_VISITOR_RETENTION_DAYS = 30;

/**
 * Hashed address with first and last visit, used to tell new from returning
 * visitors. Removed 30 days after the last visit.
 */
export interface ILandingVisitor extends Document {
	ipHash: string;
	firstSeen: Date;
	lastSeen: Date;
}

const schema = new Schema<ILandingVisitor>({
	ipHash: { type: String, required: true },
	firstSeen: { type: Date, required: true },
	lastSeen: { type: Date, required: true },
});

schema.index({ ipHash: 1 }, { unique: true });
schema.index({ lastSeen: 1 }, { expireAfterSeconds: 60 * 60 * 24 * LANDING_VISITOR_RETENTION_DAYS });

export const LandingVisitor: Model<ILandingVisitor> = mongoose.model<ILandingVisitor>("LandingVisitor", schema);
