import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Model, Schema, model } from "mongoose";

export enum EXECUTION_MODE {
    TAN = "TAN",
    DEFAULT = "DEFAULT",
    PERSONAL = "PERSONAL",
    ANONYMOUS = "ANONYMOUS"
}

interface SurveyMetaAttrs extends SVHMetadataAttrs {
    options: {
        executionMode: EXECUTION_MODE;
        tans?: {
            code: string;
            isUsed: boolean;
        }[];
        isActive: boolean;
        startDate?: Date | null;
        endDate?: Date | null;
        redirectionUrl?: string | null;
        resultsSharing?: boolean;
        showQuestionNumbers?: boolean;
    }
}

interface SurveyMetaModel extends Model<SurveyMetaDoc> {
    build: (attrs: SurveyMetaAttrs) => SurveyMetaDoc;
}

export interface SurveyMetaDoc extends SVHMetadataDoc {
    options: {
        executionMode: EXECUTION_MODE;
        tans?: {
            code: string;
            isUsed: boolean;
        }[];
        isActive: boolean;
        startDate?: Date | null;
        endDate?: Date | null;
        redirectionUrl?: string | null;
        resultsSharing?: boolean;
        showQuestionNumbers?: boolean;
    },
}

const SurveyMetaSchema = new Schema({
    options: {
        executionMode: { type: String, required: true, enum: Object.values(EXECUTION_MODE) },
        tans: {
            type: [{
                code: { type: String, required: true },
                isUsed: { type: Boolean, required: true, default: false },
                _id: false,
            }], default: []
        },
        isActive: { type: Boolean, required: true, default: false },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        redirectionUrl: { type: String, default: null },
        resultsSharing: { type: Boolean, default: false },
        showQuestionNumbers: { type: Boolean, default: true },
    }
})

SurveyMetaSchema.add(SVHMetadataSchema)

SurveyMetaSchema.statics.build = (attrs: SurveyMetaAttrs) => {
    return new SurveyMeta(attrs);
}

const SurveyMeta = model<SurveyMetaDoc, SurveyMetaModel>("SurveyMeta", SurveyMetaSchema);

export default SurveyMeta;