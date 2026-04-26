import { Document, Model, Schema, Types, model } from "mongoose";

interface ContactAttrs {
    contactGroupIds: Types.ObjectId[];
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    description?: string;
    street?: string;
    zip?: string;
    city?: string;
}

interface ContactModel extends Model<ContactDoc> {
    build: (attrs: ContactAttrs) => ContactDoc;
}

export interface ContactDoc extends Document {
    contactGroupIds: Types.ObjectId[];
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    description?: string;
    street?: string;
    zip?: string;
    city?: string;
}

const ContactSchema = new Schema({
    contactGroupIds: [{ type: Types.ObjectId, required: true, ref: 'ContactGroup' }],
    title: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    description: { type: String, default: '' },
    street: { type: String, default: '' },
    zip: { type: String, default: '' },
    city: { type: String, default: '' }
}, { timestamps: true });

ContactSchema.statics.build = (attrs: ContactAttrs) => {
    return new Contact(attrs);
}

const Contact = model<ContactDoc, ContactModel>("Contact", ContactSchema);

export default Contact;