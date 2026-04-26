import { Document } from "mongodb";
import { Model, Schema, Types, model } from "mongoose";

interface UserContactAttrs {
    first_name: string;
    last_name: string;
}

interface UserContactModel extends Model<UserContactDoc> {
    build(attrs: UserContactAttrs): UserContactDoc;
}

export interface UserContactDoc extends Document {
    _id: Types.ObjectId,
    first_name: string;
    last_name: string;
}

const UserContactSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
});

UserContactSchema.statics.build = (attrs: UserContactAttrs) => {
    return new UserContact(attrs);
}

const UserContact = model<UserContactDoc, UserContactModel>("UserContact", UserContactSchema);

export default UserContact;

