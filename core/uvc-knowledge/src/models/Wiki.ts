import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Document, Model, Schema, Types, model } from "mongoose";

// Table of Contents
const WikiTocSchema = new Schema({
    title: { type: String, required: true },
    sectionId: { type: Types.ObjectId, ref: 'WikiSection' },
});

WikiTocSchema.add({
    children: [WikiTocSchema]  // Recursively embed the same schema for endless depth
});

export interface ToCAttrs {
    title: string;
    sectionId: Types.ObjectId;
    children?: ToCAttrs[];
}

interface WikiAttrs extends SVHMetadataAttrs {
    tableOfContents: ToCAttrs[];
}

interface WikiModel extends Model<WikiDoc> {
    build: (attrs: WikiAttrs) => WikiDoc;
}

export interface WikiDoc extends SVHMetadataDoc {
    _id: Types.ObjectId;
    tableOfContents: ToCAttrs[];
}

const WikiSchema = new Schema({
    tableOfContents: [WikiTocSchema],
})

WikiSchema.add(SVHMetadataSchema);

WikiSchema.statics.build = (attrs: WikiAttrs) => {
    return new Wiki(attrs);
}

const Wiki = model<WikiDoc, WikiModel>("Wiki", WikiSchema);

export default Wiki;