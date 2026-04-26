import { Document, Model, Schema, model } from "mongoose";

interface DomainAttrs {
    title: string;
    shortcode: string;
    idpIdentifier?: string;
}

interface DomainModel extends Model<DomainDoc> {
    build: (attrs: DomainAttrs) => DomainDoc;
}

export interface DomainDoc extends Document {
    title: string;
    shortcode: string;
    idpIdentifier?: string;
}

const DomainSchema = new Schema({
    title: { type: String, required: true },
    shortcode: { type: String, required: true },
    idpIdentifier: { type: String, required: false },
})

DomainSchema.statics.build = (attrs: DomainAttrs) => {
    return new Domain(attrs);
}

const Domain = model<DomainDoc, DomainModel>("Domain", DomainSchema);

export default Domain;