import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILandingIpHash extends Document {
	day: Date;
	slot: string;
	ipHash: string;
	createdAt: Date;
}

const schema = new Schema<ILandingIpHash>({
	day: { type: Date, required: true },
	slot: { type: String, required: true },
	ipHash: { type: String, required: true },
	createdAt: { type: Date, required: true, default: () => new Date() },
});

schema.index({ day: 1, slot: 1, ipHash: 1 }, { unique: true });
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 48 });

export const LandingIpHash: Model<ILandingIpHash> = mongoose.model<ILandingIpHash>("LandingIpHash", schema);
