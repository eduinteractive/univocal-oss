import { Document, Model, Schema, Types, model } from "mongoose";

export type WikiSectionType = "editor" | "etherpad";

interface WikiSectionAttrs {
    wikiId: Types.ObjectId;
    title: string;
    content?: string;
    type?: WikiSectionType;
    etherpadPadId?: string;
    materials:
    {
        title: string,
        link: string,
        mimetype: string
    }[]
}

interface WikiSectionModel extends Model<WikiSectionDoc> {
    build: (attrs: WikiSectionAttrs) => WikiSectionDoc;
}

export interface WikiSectionDoc extends Document {
    _id: Types.ObjectId;
    title: string;
    content?: string;
    type?: WikiSectionType;
    etherpadPadId?: string;
    wikiId: Types.ObjectId;
    materials:
    {
        title: string,
        link: string,
        mimetype: string
    }[]
}

const WikiSectionSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    type: { type: String, enum: ["editor", "etherpad"] },
    etherpadPadId: { type: String },
    wikiId: { type: Types.ObjectId, ref: 'Wiki' },
    materials: {
        type: [
            {
                title: { type: String, required: true },
                link: { type: String, required: true },
                mimetype: { type: String, required: true }
            },
        ], default: [], required: true, _id: false
    }
});

WikiSectionSchema.statics.build = (attrs: WikiSectionAttrs) => {
    return new WikiSection(attrs);
}

const WikiSection = model<WikiSectionDoc, WikiSectionModel>("WikiSection", WikiSectionSchema);

export default WikiSection;
