import { Model, Document, Schema, Types, model } from "mongoose";

interface SurveyResultAttrs {
    surveyId: Types.ObjectId;
    personal: {
        identifier?: string;
    },
    answers: {
        key: string;
        value: any;
    }[];
}

interface SurveyComponentModel extends Model<SurveyResultDoc> {
    build(attrs: SurveyResultAttrs): SurveyResultDoc;
}

export interface SurveyResultDoc extends Document {
    surveyId: Types.ObjectId;
    personal: {
        identifier?: string;
    },
    answers: {
        key: string;
        value: any;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const SurveyResultSchema = new Schema({
    surveyId: { type: Types.ObjectId, ref: "SurveyMeta", required: true },
    personal: {
        identifier: { type: String }
    },
    answers: {
        type: [{
            key: { type: String, required: true },
            value: { type: Schema.Types.Mixed },
        }],
        required: false,
        _id: false,
        default: [],
    }
}, { timestamps: true })

SurveyResultSchema.statics.build = (attrs: SurveyResultAttrs) => {
    return new SurveyResult(attrs);
}

const SurveyResult = model<SurveyResultDoc, SurveyComponentModel>("SurveyResult", SurveyResultSchema);

export default SurveyResult;