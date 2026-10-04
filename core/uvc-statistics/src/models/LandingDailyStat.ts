import mongoose, { Document, Model, Schema } from "mongoose";

export interface LandingStatDims {
	path: string;
	cta: string;
	morigin: string;
	referrer: string;
	country: string;
	device: string;
	key: string;
	bucket: string;
}

export type LandingStatMetric =
	| "page_view"
	| "cta_click"
	| "unique_visitor"
	| "new_visitor"
	| "returning_visitor"
	| "entry_page"
	| "depth_reached"
	| "transition"
	| "milestone"
	| "visitor_attr"
	| "conversion"
	| "converted_visitor"
	| "hourly"
	| "scroll"
	| "time_sum"
	| "time_count"
	| "time_bucket"
	| "section_view"
	| "nav_click"
	| "outbound_click"
	| "faq_open"
	| "interaction"
	| "vital"
	| "vital_sum"
	| "vital_count"
	| "client_error"
	| "bot_hit";

export interface ILandingDailyStat extends Document {
	metric: LandingStatMetric;
	timestamp: Date;
	value: number;
	dims: LandingStatDims;
}

const dimsSchema = new Schema<LandingStatDims>(
	{
		path: { type: String, required: true, default: "" },
		cta: { type: String, required: true, default: "" },
		morigin: { type: String, required: true, default: "" },
		referrer: { type: String, required: true, default: "" },
		country: { type: String, required: true, default: "" },
		device: { type: String, required: true, default: "" },
		key: { type: String, required: true, default: "" },
		bucket: { type: String, required: true, default: "" },
	},
	{ _id: false }
);

const schema = new Schema<ILandingDailyStat>({
	metric: { type: String, required: true },
	timestamp: { type: Date, required: true },
	value: { type: Number, required: true, default: 0 },
	dims: { type: dimsSchema, required: true },
});

schema.index(
	{
		metric: 1,
		timestamp: 1,
		"dims.path": 1,
		"dims.cta": 1,
		"dims.morigin": 1,
		"dims.referrer": 1,
		"dims.country": 1,
		"dims.device": 1,
		"dims.key": 1,
		"dims.bucket": 1,
	},
	{ unique: true }
);

export const LandingDailyStat: Model<ILandingDailyStat> = mongoose.model<ILandingDailyStat>("LandingDailyStat", schema);
