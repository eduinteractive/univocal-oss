import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * One document per hashed address and UTC day. Holds only coarse attribution
 * (entry page, source label, device class, country) and is removed after 48h.
 */
export interface ILandingVisitorDay extends Document {
	day: Date;
	ipHash: string;
	events: number;
	paths: string[];
	lastPath: string;
	entry: string;
	source: string;
	device: string;
	country: string;
	converted: boolean;
	createdAt: Date;
}

const schema = new Schema<ILandingVisitorDay>({
	day: { type: Date, required: true },
	ipHash: { type: String, required: true },
	events: { type: Number, required: true, default: 0 },
	paths: { type: [String], default: [] },
	lastPath: { type: String, default: "" },
	entry: { type: String, default: "" },
	source: { type: String, default: "" },
	device: { type: String, default: "" },
	country: { type: String, default: "" },
	converted: { type: Boolean, default: false },
	createdAt: { type: Date, required: true, default: () => new Date() },
});

schema.index({ day: 1, ipHash: 1 }, { unique: true });
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 48 });

export const LandingVisitorDay: Model<ILandingVisitorDay> = mongoose.model<ILandingVisitorDay>("LandingVisitorDay", schema);
