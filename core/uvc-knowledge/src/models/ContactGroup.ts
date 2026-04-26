import { SVHMetadataAttrs, SVHMetadataDoc, SVHMetadataSchema } from "@eduinteractive/uvc-common";
import { Document, Model, Schema, Types, model } from "mongoose";

interface ContactGroupAttrs extends SVHMetadataAttrs {}

interface ContactGroupModel extends Model<ContactGroupDoc> {
    build: (attrs: ContactGroupAttrs) => ContactGroupDoc;
}

export interface ContactGroupDoc extends SVHMetadataDoc {}

const ContactGroupSchema = new Schema({})

ContactGroupSchema.add(SVHMetadataSchema);

ContactGroupSchema.statics.build = (attrs: ContactGroupAttrs) => {
    return new ContactGroup(attrs);
}

const ContactGroup = model<ContactGroupDoc, ContactGroupModel>("ContactGroup", ContactGroupSchema);

export default ContactGroup;