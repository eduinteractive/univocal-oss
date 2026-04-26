/**
 * Base Definitions
 */

import { Model, Document, Schema, Types, model } from "mongoose";

export enum SurveyComponentType {
    TEXT = "TEXT",
    LIKERT = "LIKERT",
    CHOICE = "CHOICE",
    OPEN = "OPEN",
    WORDCLOUD = "WORDCLOUD",
    NOMINAL = "NOMINAL",
}

export interface SurveyComponentAttrs {
    surveyId: Types.ObjectId;
    title: string;
    required?: boolean;
    next?: Types.ObjectId;
    previous?: Types.ObjectId;
    type: SurveyComponentType;
}

interface SurveyComponentModel extends Model<SurveyComponentDoc> {
    build(attrs: SurveyComponentAttrs): SurveyComponentDoc;
}

export interface SurveyComponentDoc extends Document {
    _id: Types.ObjectId;
    surveyId: Types.ObjectId;
    title: string;
    required?: boolean;
    next?: Types.ObjectId;
    previous?: Types.ObjectId;
    type: SurveyComponentType;
    createdAt: Date;
    updatedAt: Date;
}

const SurveyComponentSchema = new Schema({
    surveyId: { type: Types.ObjectId, ref: "SurveyMeta", required: true },
    title: { type: String, required: true },
    required: { type: Boolean, default: false },
    next: { type: Types.ObjectId, ref: "SurveyComponent" },
    previous: { type: Types.ObjectId, ref: "SurveyComponent" },
    type: { type: String, required: true, enum: Object.values(SurveyComponentType) }
}, {
    timestamps: true, discriminatorKey: "type"
})

SurveyComponentSchema.statics.build = (attrs: SurveyComponentAttrs) => {
    return new SurveyComponent(attrs);
}

const SurveyComponent = model<SurveyComponentDoc, SurveyComponentModel>("SurveyComponent", SurveyComponentSchema);

export default SurveyComponent;

/**
 * Component specific definitions
 */

/** Text Component **/

export interface SurveyComponentTextAttrs extends SurveyComponentAttrs {
    description?: string;
}

export interface SurveyComponentTextDoc extends SurveyComponentDoc {
    description?: string;
}

export interface SurveyComponentTextModel extends Model<SurveyComponentTextDoc> {
    build(attrs: SurveyComponentTextAttrs): SurveyComponentTextDoc;
}

export const SurveyComponentText = SurveyComponent.discriminator<SurveyComponentTextDoc, SurveyComponentTextModel>("TEXT", new Schema({
    description: { type: String, default: "" }
}, { _id: false }));

/** Likert Component **/

export interface SurveyComponentLikertAttrs extends SurveyComponentAttrs {
    scale: {
        labels: string[];
    }
}

export interface SurveyComponentLikertDoc extends SurveyComponentDoc {
    scale: {
        labels: string[];
    }
}

export interface SurveyComponentLikertModel extends Model<SurveyComponentLikertDoc> {
    build(attrs: SurveyComponentLikertAttrs): SurveyComponentLikertDoc;
}

export const SurveyComponentLikert = SurveyComponent.discriminator<SurveyComponentLikertDoc, SurveyComponentLikertModel>("LIKERT", new Schema({
    scale: {
        labels: { type: [String], required: true }
    }
}, { _id: false }));

/** Choice Component **/

export interface SurveyComponentChoiceAttrs extends SurveyComponentAttrs {
    choices: string[];
    multiple: boolean;
    max?: number;
}

export interface SurveyComponentChoiceDoc extends SurveyComponentDoc {
    choices: string[];
    multiple: boolean;
    max?: number;
}

export interface SurveyComponentChoiceModel extends Model<SurveyComponentChoiceDoc> {
    build(attrs: SurveyComponentChoiceAttrs): SurveyComponentChoiceDoc;
}

export const SurveyComponentChoice = SurveyComponent.discriminator<SurveyComponentChoiceDoc, SurveyComponentChoiceModel>("CHOICE", new Schema({
    choices: { type: [String], required: true },
    multiple: { type: Boolean, required: true },
    max: { type: Number }
}, { _id: false }));

/** Open Component **/

export interface SurveyComponentOpenAttrs extends SurveyComponentAttrs { }

export interface SurveyComponentOpenDoc extends SurveyComponentDoc { }

export interface SurveyComponentOpenModel extends Model<SurveyComponentOpenDoc> {
    build(attrs: SurveyComponentOpenAttrs): SurveyComponentOpenDoc;
}

export const SurveyComponentOpen = SurveyComponent.discriminator<SurveyComponentOpenDoc, SurveyComponentOpenModel>("OPEN", new Schema({}, { _id: false }));

/** Wordcloud Component **/

export interface SurveyComponentWordcloudAttrs extends SurveyComponentAttrs {}

export interface SurveyComponentWordcloudDoc extends SurveyComponentDoc {}

export interface SurveyComponentWordcloudModel extends Model<SurveyComponentWordcloudDoc> {
    build(attrs: SurveyComponentWordcloudAttrs): SurveyComponentWordcloudDoc;
}

export const SurveyComponentWordcloud = SurveyComponent.discriminator<SurveyComponentWordcloudDoc, SurveyComponentWordcloudModel>("WORDCLOUD", new Schema({}, { _id: false }));

/** Nominal Component **/

export enum SurveyComponentNominalType {
    YESNO = "YESNO",
    CHECK = "CHECK",
    SEX = "SEX",
}

export interface SurveyComponentNominalAttrs extends SurveyComponentAttrs {
    nominalType: SurveyComponentNominalType;
}

export interface SurveyComponentNominalDoc extends SurveyComponentDoc {
    nominalType: SurveyComponentNominalType;
}

export interface SurveyComponentNominalModel extends Model<SurveyComponentNominalDoc> {
    build(attrs: SurveyComponentNominalAttrs): SurveyComponentNominalDoc;
}

export const SurveyComponentNominal = SurveyComponent.discriminator<SurveyComponentNominalDoc, SurveyComponentNominalModel>("NOMINAL", new Schema({
    nominalType: { type: String, required: true, enum: Object.values(SurveyComponentNominalType) }
}, { _id: false }));