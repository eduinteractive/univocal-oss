import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITimeSeriesStat extends Document {
	metric: string;
	timestamp: Date;
	value: number;
}

const schema = new Schema<ITimeSeriesStat>({
	metric: { type: String, required: true },
	timestamp: { type: Date, required: true },
	value: { type: Number, required: true },
});

schema.index({ metric: 1, timestamp: 1 });

export const TimeSeriesStat: Model<ITimeSeriesStat> = mongoose.model<ITimeSeriesStat>("TimeSeriesStat", schema);
